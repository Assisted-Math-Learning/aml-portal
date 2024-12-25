/* eslint-disable func-names, react/no-this-in-sfc,  no-unsafe-optional-chaining, no-lonely-if, jsx-a11y/no-autofocus */
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FibType, QuestionType } from 'models/enums/QuestionType.enum';

import { ArithmaticOperations } from 'models/enums/ArithmaticOperations.enum';
import {
  FeedbackType,
  FormValues,
  QuestionPropsType,
} from 'shared-resources/components/questionUtils';
import { convertLearnerResponseToSingleResponse } from 'shared-resources/utils/helpers';
import { indexedDBService } from 'services/IndexedDBService';
import MCQQuestion from './MCQQuestion';
import FIBQuestion from './FIBQuestion';
import Grid2Question from './Grid2Question';
import Grid1Question from './Grid1Question';
import Loader from './Loader/Loader';

export interface QuestionProps {
  question: QuestionPropsType;
  onSubmit: (gridData: any) => void;
  onValidityChange: (validity: boolean) => void;
  keyPressed?: {
    key: string;
    counter: number;
  };
  backSpacePressed?: {
    isBackSpaced: boolean;
    counter: number;
  };
  errors: {
    [key: string]: boolean[] | boolean[][];
  };
  setQuestionFeedback: () => void;
  questionFeedback?: FeedbackType | null;
}

// Using forwardRef to forward refs to the parent component
const Question = forwardRef(
  (
    {
      question,
      onSubmit,
      onValidityChange,
      keyPressed,
      backSpacePressed,
      errors,
      setQuestionFeedback,
      questionFeedback,
    }: QuestionProps,
    ref
  ) => {
    const { answers, numbers } = question;
    const [activeField, setActiveField] = useState<keyof FormValues | null>(
      null
    );
    const [isLoadingResponse, setIsLoadingResponse] = useState(false);
    const [response, setResponse] = useState<any>({});

    const isFibQuestion = question.questionType === QuestionType.FIB;
    const isDivisionOperation =
      question.operation === ArithmaticOperations.DIVISION;

    const validateQuotientRemainderDivisionFib =
      isFibQuestion &&
      isDivisionOperation &&
      (answers.fib_type === FibType.FIB_QUOTIENT_REMAINDER ||
        answers.fib_type === FibType.FIB_QUOTIENT_REMAINDER_WITH_IMAGE);

    const validateStandardFib =
      (isFibQuestion && !isDivisionOperation) ||
      (isFibQuestion &&
        isDivisionOperation &&
        (answers.fib_type === FibType.FIB_STANDARD ||
          answers.fib_type === FibType.FIB_STANDARD_WITH_IMAGE));

    const validationSchema = Yup.object({
      topAnswer: Yup.array()
        .of(
          Yup.string().test(
            'is-topAnswer-valid',
            'Must be a single digit or #',
            (value: any) => {
              if (!answers?.isPrefil) {
                return true; // Skip validation if isPrefill is false
              }
              return question.operation === ArithmaticOperations.SUBTRACTION
                ? /^\d{1,2}$|^#$/.test(value)
                : /^\d$/.test(value) || value === '#'; // Valid when it's a digit or #
            }
          )
        )
        .test(
          'is-no-empty-strings',
          'Top answer cannot be empty',
          (value: any) => {
            if (!answers?.isPrefil) {
              return true; // Skip validation if isPrefill is false
            }
            return value.every((item: string) => item !== ''); // Check that no empty strings are present
          }
        )
        .test('is-topAnswer-required', 'Top answer is required', (value) => {
          if (!answers?.isPrefil) {
            return true; // Skip validation if isPrefill is false
          }
          return value && value.length > 0; // Ensure the array has at least one valid entry
        }),

      answerIntermediate: Yup.lazy(() => {
        if (
          question.operation === ArithmaticOperations.DIVISION &&
          question.questionType === QuestionType.GRID_1
        ) {
          return Yup.array()
            .of(
              Yup.array().of(
                Yup.string().test(
                  'validate-b-and-hash',
                  'Input must be a single digit',
                  (value: any, context) => {
                    if (!answers?.answerIntermediate?.length) {
                      return true; // Validation passes without errors
                    }
                    const { answerIntermediate } = answers; // Access original string
                    const parts = answerIntermediate?.split('|'); // Original input string split into rows
                    const rowIndex = context.path.match(/\d+/g)?.[0]; // Get row index
                    const colIndex = context.path.match(/\d+/g)?.[1]; // Get column index
                    if (rowIndex === undefined || colIndex === undefined) {
                      return true; // Skip validation if indices are missing
                    }
                    const originalChar = parts[+rowIndex]?.[+colIndex]; // Get the original character
                    if (question.operation === ArithmaticOperations.DIVISION) {
                      if (originalChar === 'B') {
                        // "B" must be filled with a number
                        return /^\d$/.test(value);
                      }
                      if (originalChar === '#') {
                        // "#" can remain empty
                        return value === '' || value === undefined;
                      }
                    }

                    return true; // Skip validation for non-DIVISION cases
                  }
                )
              )
            )
            .test(
              'validate-row-has-inputs',
              'Each row must have at least one filled input for DIVISION',
              (value, context) => {
                if (!answers?.answerIntermediate?.length) {
                  return true; // Validation passes without errors
                }
                const { answerIntermediate } = answers || {};
                const parts = answerIntermediate?.split('|'); // Original string split into rows
                const rowIndex = context.path.match(/\d+/g)?.[0]; // Get row index
                const colIndex = context.path.match(/\d+/g)?.[1]; // Get column index
                if (rowIndex === undefined || colIndex === undefined) {
                  return true; // Skip validation if indices are missing
                }
                const originalChar = parts[+rowIndex]?.[+colIndex]; // Get the original character
                if (question.operation === ArithmaticOperations.DIVISION) {
                  return value?.every((row) => {
                    const hasValidInput = row?.some((input) => {
                      const normalizedInput = input ?? ''; // Treating null/undefined as empty
                      // Only validating cells marked as 'B' in the original string
                      return (
                        originalChar === 'B' &&
                        !!normalizedInput &&
                        /^\d$/.test(normalizedInput)
                      );
                    });

                    return hasValidInput; // At least one valid input in the row
                  });
                }

                return true; // Skip for non-DIVISION cases
              }
            );
        }
        if (
          question.operation === ArithmaticOperations.MULTIPLICATION &&
          question.questionType === QuestionType.GRID_1
        ) {
          return Yup.array().of(
            Yup.string().test(
              'validate-all-filled-for-multiplication',
              'All inputs must be filled for MULTIPLICATION',
              (value) => {
                if (!answers?.isIntermediatePrefill) {
                  return true; // Validation passes without errors
                }
                return !!value;
              } // Check that each input is not empty
            )
          );
        }
        return Yup.mixed(); // Default validation (skipped) for other operations
      }),
      resultAnswer: Yup.array()
        .of(
          Yup.string()
            .required('Required')
            .matches(/^\d$/, 'Must be a single digit')
        )
        .test(
          'is-resultAnswer-required',
          'Result answer is required',
          function (value) {
            const { questionType } = this.parent;
            return (
              questionType !== QuestionType.GRID_1 ||
              question.operation === ArithmaticOperations.DIVISION ||
              (value && value.length > 0)
            );
          }
        ),
      row1Answers: Yup.array()
        .of(Yup.string().nullable()) // Allow nulls for individual entries
        .test(
          'row1Answers-required',
          'Row 1 answers are required',
          function (value) {
            const { questionType } = this.parent; // Access parent context
            if (questionType === QuestionType.GRID_2) {
              return (
                value && value.some((answer) => answer && answer.trim() !== '')
              );
              // At least one non-empty answer is required
            }
            return true; // If not grid-2, skip validation
          }
        ),
      row2Answers: Yup.array()
        .of(Yup.string().nullable())
        .test(
          'row2Answers-required',
          'Row 2 answers are required',
          function (value) {
            const { questionType } = this.parent; // Access parent context
            if (questionType === QuestionType.GRID_2) {
              return (
                value && value.some((answer) => answer && answer.trim() !== '')
              );
              // At least one non-empty answer is required
            }
            return true; // If not grid-2, skip validation
          }
        ),
      fibAnswer: Yup.string()
        .nullable()
        .test(
          'fibAnswer-required',
          'Answer is required for Fill in the Blank',
          (value) => {
            if (value === '.') {
              return false; // Invalid if only a period
            }
            if (validateStandardFib) {
              return !!value; // Return true if value is provided (not null or empty)
            }
            return true; // Skip validation if not 'fib'
          }
        ),
      answerQuotient: Yup.mixed()
        .nullable()
        .test(
          'validate-answerQuotient',
          'Invalid value in answerQuotient',
          function (value) {
            const { questionType } = this.parent;

            // Validation for GRID_1
            if (
              questionType === QuestionType.GRID_1 &&
              question.operation === ArithmaticOperations.DIVISION
            ) {
              if (Array.isArray(value)) {
                // Ensuring all elements in the array are valid
                return value.every(
                  (val) => val !== null && val !== '' && /^\d$/.test(val) // Must be a single digit
                );
              }
              return false; // Invalid if not an array
            }

            // Validation for other types (e.g., FIB)
            if (validateQuotientRemainderDivisionFib) {
              if (typeof value === 'string') {
                return value !== null && value !== '' && value !== '.'; // Must not be empty or invalid
              }
              return false; // Invalid if not a string
            }

            return true; // Skip validation for other question types
          }
        ),

      answerRemainder: Yup.mixed()
        .nullable()
        .test(
          'validate-answerRemainder',
          'Invalid value in answerRemainder',
          function (value) {
            const { questionType } = this.parent;

            // Validation for GRID_1
            if (
              questionType === QuestionType.GRID_1 &&
              question.operation === ArithmaticOperations.DIVISION
            ) {
              if (Array.isArray(value)) {
                return value.every((val, idx) => {
                  const initialValue = answers?.answerRemainder?.[idx]; // Corresponding initial character
                  if (initialValue === '#') {
                    return true; // '#' is always valid
                  }
                  if (initialValue === 'B') {
                    return val !== '' && /^\d$/.test(val); // Must be a single digit, cannot be empty
                  }
                  return /^\d$/.test(val); // For numbers, must be a single digit
                });
              }
              return false;
            }

            // Validation for other types (e.g., FIB)
            if (validateQuotientRemainderDivisionFib) {
              if (typeof value === 'string') {
                return value !== null && value !== '' && value !== '.'; // Must not be empty or invalid
              }
              return false; // Invalid if not a string
            }

            return true; // Skip validation for other question types
          }
        ),
      mcqAnswer: Yup.string()
        .nullable()
        .test(
          'mcqAnswer-required',
          'Please select an option for the MCQ question',
          function (value) {
            const { questionType } = this.parent; // Access parent context
            if (questionType === QuestionType.MCQ) {
              return !!value; // Ensure a selection is made
            }
            return true; // Skip validation if not 'mcq'
          }
        ),
    });

    const maxLength = Math.max(
      ...Object.values(numbers).map((num) => (num || '').length)
    );

    // replace empty string values with "0" which fall after first "number" element
    const transformEmptyValuesToZero = (arr: string[]) => {
      const firstNonEmptyIndex = arr.findIndex((e) => e !== '');
      if (firstNonEmptyIndex === -1) return '';
      return arr.map((val, index) =>
        index > firstNonEmptyIndex && val === '' ? '0' : val
      );
    };

    const formik = useFormik<FormValues>({
      initialValues: {
        topAnswer:
          response.topAnswer ||
          (question.operation === ArithmaticOperations.SUBTRACTION
            ? answers?.answerTop
                ?.split('|') // Spliting for subtraction
                ?.map((val) => (val === 'B' ? '' : val)) // Handling blank input
            : answers?.answerTop
                ?.split('')
                ?.map((val) => (val === 'B' ? '' : val))),
        resultAnswer:
          response.resultAnswer ||
          answers?.answerResult
            ?.split('')
            ?.map((val) => (val === 'B' ? '' : val)),
        answerIntermediate:
          response.answerIntermediate ||
          (question.operation === ArithmaticOperations.DIVISION
            ? answers?.answerIntermediate
                ?.split('|')
                .map((row) =>
                  row
                    .split('')
                    .map((val) => (val === 'B' || val === '#' ? '' : val))
                )
            : answers?.answerIntermediate
                ?.split('#') // Split into rows for non-DIVISION operations
                .flatMap((row) =>
                  row
                    .split('')
                    .map((val) => (val === 'B' || val === '#' ? '' : val))
                )),
        answerQuotient:
          response.answerQuotient ||
          (question.questionType === QuestionType.GRID_1 &&
          question.operation === ArithmaticOperations.DIVISION
            ? answers?.answerQuotient
                ?.split('')
                ?.map((val) => (val === 'B' ? '' : val))
            : ''),
        answerRemainder:
          response.answerRemainder ||
          (question.questionType === QuestionType.GRID_1 &&
          question.operation === ArithmaticOperations.DIVISION
            ? answers?.answerRemainder
                ?.split('')
                ?.map((val) => (val === 'B' ? '' : val))
            : ''),
        row1Answers: Array(maxLength - (response.row1Answers?.length ?? 0))
          .fill('')
          .concat(response.row1Answers ?? []),
        row2Answers: Array(maxLength - (response.row2Answers?.length ?? 0))
          .fill('')
          .concat(response.row2Answers ?? []),
        questionType: question.questionType,
        fibAnswer: response.fibAnswer || '',
        mcqAnswer: response.mcqAnswer || '',
        questionId: question.questionId,
      },
      enableReinitialize: true,
      validateOnMount: true,
      validationSchema,
      onSubmit: (values) => {
        if (question.questionType === QuestionType.GRID_1) {
          onSubmit({
            questionId: question.questionId,
            topAnswer: values.topAnswer,
            resultAnswer: values.resultAnswer,
            answerQuotient: values.answerQuotient,
            answerRemainder: values.answerRemainder,
            operation: question.operation,
            answerIntermediate: values?.answerIntermediate,
          });
        } else if (question.questionType === QuestionType.GRID_2) {
          onSubmit({
            row1Answers: transformEmptyValuesToZero(values.row1Answers),
            row2Answers: transformEmptyValuesToZero(values.row2Answers),
            questionId: question.questionId,
          });
        } else if (question.questionType === QuestionType.FIB) {
          onSubmit({
            questionId: question.questionId,
            fibAnswer: values.fibAnswer,
            answerQuotient: values.answerQuotient,
            answerRemainder: values.answerRemainder,
            operation: question.operation,
          });
        } else if (question.questionType === QuestionType.MCQ) {
          onSubmit({
            questionId: question.questionId,
            mcqAnswer: values.mcqAnswer,
          });
        }
      },
    });

    const handleSetFieldValue = (
      _activeField: keyof FormValues,
      value?: string
    ) => {
      const activeFieldPath = _activeField.split('.'); // Spliting the field path by '.'

      // Dynamically constructing the full field path based on the depth
      const fullActiveFieldPath = activeFieldPath
        .map((segment, index) => (index === 0 ? segment : `[${segment}]`))
        .join(''); // Joining the segments to form the full path

      if (activeFieldPath.length === 1) {
        // For single-level fields, using the field name directly
        formik.setFieldValue(_activeField, value);
      } else {
        // For nested fields, using the constructed path
        formik.setFieldValue(fullActiveFieldPath, value);
      }
    };

    const separateKeys = (input: string) => {
      const [mainKey, subKey] = input.split('.');
      return { mainKey, subKey };
    };

    useEffect(() => {
      const fetchResponse = async () => {
        setIsLoadingResponse(true);
        const entryExists = (await indexedDBService.queryObjectsByKey(
          'question_id',
          question.questionId
        )) as any[];
        if (entryExists && entryExists.length) {
          const resp = convertLearnerResponseToSingleResponse(
            entryExists[0],
            question
          );
          setResponse(resp);
        }
        setIsLoadingResponse(false);
      };
      fetchResponse();

      return () => setResponse({});
    }, [question]);

    useEffect(() => {
      if (!keyPressed || !backSpacePressed || !activeField) return;
      const isKeyPressed = keyPressed.key !== '';
      const { isBackSpaced } = backSpacePressed;
      const { mainKey, subKey } = separateKeys(activeField);
      const isTopAnswerField = mainKey === 'topAnswer';
      const isSubtraction =
        question.operation === ArithmaticOperations.SUBTRACTION;

      let updatedValue =
        isSubtraction && isTopAnswerField
          ? String((formik.values as any)?.[mainKey]?.[subKey] || '')
          : String(formik.values?.[activeField] || '');

      if (
        (backSpacePressed.counter > 0 || keyPressed.counter > 0) &&
        (isKeyPressed || isBackSpaced)
      ) {
        if (isBackSpaced) {
          updatedValue = updatedValue.slice(0, -1);
        } else if (isKeyPressed) {
          // eslint-disable-next-line no-nested-ternary
          const maxLength = isTopAnswerField ? (isSubtraction ? 2 : 1) : 9;
          if (updatedValue.length < maxLength) {
            updatedValue += keyPressed.key;
          }

          keyPressed.key = '';
        }

        handleSetFieldValue(activeField, updatedValue);
        if (isBackSpaced) {
          backSpacePressed.isBackSpaced = false;
        }
      }
    }, [keyPressed, backSpacePressed, activeField]);

    // Expose the submitForm method to the parent component
    useImperativeHandle(ref, () => ({
      submitForm: formik.handleSubmit,
      resetForm: () => {
        setActiveField(null);
        formik.resetForm();
      },
    }));

    useEffect(() => {
      if (formik.isValidating) return;
      onValidityChange(formik.isValid); // Pass the form's validity to the parent
    }, [formik.isValid, formik.isValidating, onValidityChange]);

    if (isLoadingResponse) {
      return <Loader />;
    }

    return (
      <form
        onSubmit={formik.handleSubmit}
        onChange={() => setQuestionFeedback()}
        className='flex flex-col space-y-4 items-start'
      >
        {question.questionType === QuestionType.GRID_1 && (
          <Grid1Question
            errors={errors}
            formik={formik}
            maxLength={maxLength}
            question={question}
            setActiveField={setActiveField}
          />
        )}

        {question.questionType === QuestionType.GRID_2 && (
          <Grid2Question
            formik={formik}
            maxLength={maxLength}
            question={question}
            setActiveField={setActiveField}
          />
        )}

        {question.questionType === QuestionType.FIB && (
          <FIBQuestion
            formik={formik}
            question={question}
            setActiveField={setActiveField}
            errors={errors}
            isAnswerIncorrect={questionFeedback === FeedbackType.INCORRECT}
          />
        )}

        {question.questionType === QuestionType.MCQ && (
          <MCQQuestion
            formik={formik}
            question={question}
            setQuestionFeedback={setQuestionFeedback}
          />
        )}
      </form>
    );
  }
);

export default Question;
