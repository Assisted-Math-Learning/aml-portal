/* eslint-disable func-names, react/no-this-in-sfc,  no-unsafe-optional-chaining, no-lonely-if, jsx-a11y/no-autofocus */
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { QuestionType } from 'models/enums/QuestionType.enum';
import { fetchQuestionImage } from 'store/actions/media.action';
import { useDispatch, useSelector } from 'react-redux';
import {
  currentImageURLSelector,
  imageErrorSelector,
  isCurrentImageLoadingSelector,
} from 'store/selectors/media.selector';

import { ArithmaticOperations } from 'models/enums/ArithmaticOperations.enum';
import {
  FormValues,
  QuestionPropsType,
} from 'shared-resources/components/questionUtils';
import Loader from './Loader/Loader';
import MCQQuestion from './MCQQuestion';
import FIBQuestion from './FIBQuestion';
import Grid2Question from './Grid2Question';
import Grid1Question from './Grid1Question';

interface QuestionProps {
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
    }: QuestionProps,
    ref
  ) => {
    const { answers, numbers, questionImage } = question;
    const dispatch = useDispatch();
    const currentImageURL = useSelector(currentImageURLSelector);
    const currentImageLoading = useSelector(isCurrentImageLoadingSelector);
    const imageError = useSelector(imageErrorSelector);
    const [imgURL, setImageURL] = useState<string | null>('');
    const [isLoading, setIsLoading] = useState(true);
    const [imgLoading, setImageLoading] = useState<boolean>(true);
    const [activeField, setActiveField] = useState<keyof FormValues | null>(
      null
    );
    const [imgError, setImgError] = useState(false);

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

      answerIntermediate: Yup.array()
        .of(
          Yup.array().of(
            Yup.string().test(
              'validate-b-and-hash',
              'Input must be a single digit',
              (value: any, context) => {
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
            const { answerIntermediate } = answers || {};
            const parts = answerIntermediate?.split('|'); // Original string split into rows
            const rowIndex = context.path.match(/\d+/g)?.[0]; // Get row index
            const colIndex = context.path.match(/\d+/g)?.[1]; // Get column index
            if (rowIndex === undefined || colIndex === undefined) {
              return true; // Skip validation if indices are missing
            }
            const originalChar = parts[+rowIndex]?.[+colIndex]; // Get the original character
            if (question.operation === ArithmaticOperations.DIVISION) {
              return value?.every((row, idx) => {
                const hasValidInput = row?.some((input, colIdx) => {
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
        )
        .test(
          'validate-all-filled-for-multiplication',
          'All inputs must be filled for MULTIPLICATION',
          function (value) {
            const { questionType } = this.parent;

            if (
              questionType === QuestionType.GRID_1 &&
              question.operation === ArithmaticOperations.MULTIPLICATION &&
              answers.isIntermediatePrefill
            ) {
              return value?.every((row) => row?.every((input) => input !== ''));
            }

            return true; // Skip for non-MULTIPLICATION cases
          }
        ),

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
          function (value) {
            const { questionType } = this.parent; // Access parent context
            if (value === '.') {
              return false; // Invalid if only a period
            }
            if (
              questionType === QuestionType.FIB &&
              question.operation !== ArithmaticOperations.DIVISION
            ) {
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
            if (
              questionType === QuestionType.FIB &&
              question.operation === ArithmaticOperations.DIVISION &&
              answers.fib_type === '2'
            ) {
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
            if (
              questionType === QuestionType.FIB &&
              question.operation === ArithmaticOperations.DIVISION &&
              answers.fib_type === '2'
            ) {
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
          question.operation === ArithmaticOperations.SUBTRACTION
            ? answers?.answerTop
                ?.split('|') // Spliting for subtraction
                ?.map((val) => (val === 'B' ? '' : val)) // Handling blank input
            : answers?.answerTop
                ?.split('')
                ?.map((val) => (val === 'B' ? '' : val)),
        resultAnswer: answers?.answerResult
          ?.split('')
          ?.map((val) => (val === 'B' ? '' : val)),
        answerIntermediate:
          question.operation === ArithmaticOperations.DIVISION
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
                ),

        answerQuotient:
          question.questionType === QuestionType.GRID_1 &&
          question.operation === ArithmaticOperations.DIVISION
            ? answers?.answerQuotient
                ?.split('')
                ?.map((val) => (val === 'B' ? '' : val))
            : '',
        answerRemainder:
          question.questionType === QuestionType.GRID_1 &&
          question.operation === ArithmaticOperations.DIVISION
            ? answers?.answerRemainder
                ?.split('')
                ?.map((val) => (val === 'B' ? '' : val))
            : '',
        row1Answers: Array(maxLength).fill(''),
        row2Answers: Array(maxLength).fill(''),
        questionType: question.questionType,
        fibAnswer: '',
        mcqAnswer: '',
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
        // Reset the form
        setActiveField(null);
        formik.resetForm();
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

    const renderDivisionIntermediateSteps = () => {
      const parts = answers.answerIntermediate.split('|');
      return parts.map((stepGroup, idx) => {
        const steps = stepGroup.split('');
        const inputBoxes = steps.map((step, stepIdx) => {
          const isEditable = step === 'B';
          const isBlank = step === '#';

          // Check if this `#` should be a `-` (i.e., it's immediately before a `B` or a number)
          const shouldRenderDash =
            isBlank &&
            (steps[stepIdx + 1] === 'B' || /[0-9]/.test(steps[stepIdx + 1])) &&
            idx % 2 === 0;

          if (shouldRenderDash) {
            return (
              <div
                key={`${idx}-${stepIdx}`}
                className='w-[44px] h-[61px] text-center font-bold text-[36px]'
              >
                -
              </div>
            );
          }

          // Render empty space for other `#` characters
          if (isBlank) {
            return (
              <div key={`${idx}-${stepIdx}`} className='w-[44px] h-[61px]' />
            );
          }

          // Render the input box or static value
          return (
            <div key={`${idx}-${stepIdx}`} className='relative'>
              {idx === 0 && stepIdx === 0 && (
                <div className='absolute left-[-30px] top-1/2 transform -translate-y-1/2 font-bold text-[36px]'>
                  -
                </div>
              )}

              <input
                type='text'
                name={`answerIntermediate.${idx}.${stepIdx}`}
                onFocus={() =>
                  setActiveField(
                    `answerIntermediate.${idx}.${stepIdx}` as keyof FormValues
                  )
                }
                value={
                  isEditable
                    ? formik.values.answerIntermediate?.[idx]?.[stepIdx] || ''
                    : step
                }
                onChange={formik.handleChange}
                maxLength={1}
                className='border-2 border-gray-900 rounded-[10px] w-[44px] h-[61px] text-center font-bold text-[36px] focus:outline-none focus:border-primary'
                disabled={!isEditable}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) e.preventDefault(); // Only allow numeric input
                }}
                onPaste={(e) => {
                  const pasteData = e.clipboardData.getData('text');
                  if (!/^[0-9]*$/.test(pasteData)) e.preventDefault(); // Prevent pasting non-numeric characters
                }}
              />
            </div>
          );
        });

        return (
          <div key={idx} className='mt-2'>
            <div className='flex space-x-3 ml-2.5'>{inputBoxes}</div>
            {(idx === 0 || idx % 2 === 0) && (
              <div className='border-2 border-gray-300 mt-2' />
            )}
          </div>
        );
      });
    };

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
    }));

    useEffect(() => {
      onValidityChange(formik.isValid); // Pass the form's validity to the parent
    }, [formik.isValid]);

    useEffect(() => {
      if (questionImage) {
        dispatch(fetchQuestionImage(questionImage));
      }
    }, [questionImage]);

    useEffect(() => {
      if (currentImageURL) {
        setImageURL(currentImageURL);
      }
    }, [currentImageURL]);

    const handleImageLoad = () => {
      setImageLoading(false);
    };

    useEffect(() => {
      setImageURL(null);
      setImgError(false);
      setImageLoading(true);
    }, [question]);

    useEffect(() => {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }, [question]);

    useEffect(() => {
      setImageLoading(true);
    }, [currentImageLoading]);

    useEffect(() => {
      if (imageError) {
        setImgError(true);
      }
    }, [imageError]);
    return isLoading ? (
      <Loader />
    ) : (
      <form
        onSubmit={formik.handleSubmit}
        className='flex flex-col space-y-4 items-start'
      >
        {question.questionType === QuestionType.GRID_1 && (
          <Grid1Question
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
          />
        )}

        {question.questionType === QuestionType.MCQ && (
          <MCQQuestion
            formik={formik}
            handleImageLoad={handleImageLoad}
            imgError={imgError}
            imgLoading={imgLoading}
            imgURL={imgURL}
            isLoading={isLoading}
            question={question}
            setImgError={setImgError}
          />
        )}
      </form>
    );
  }
);

export default Question;
