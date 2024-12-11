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
import cx from 'classnames';
import {
  ArithmaticOperations,
  operationMap,
} from 'models/enums/ArithmaticOperations.enum';
import ToggleButtonGroup from './ToggleButtonGroup/ToggleButtonGroup';
import Loader from './Loader/Loader';
import MultiLangText from './MultiLangText/MultiLangText';

interface QuestionProps {
  question: {
    answers: {
      result:
        | {
            quotient: string;
            remainder: string;
          }
        | string;
      isPrefil: boolean;
      answerTop: string;
      answerResult: string;
      answerIntermediate: string;
      answerQuotient: string;
      answerRemainder: string;
      isIntermediatePrefill?: boolean;
      fib_type?: '1' | '2';
    };
    numbers: {
      [key: string]: string;
    };
    questionType: QuestionType;
    questionId: string;
    options?: string[];
    name?: { en: string };
    operation: ArithmaticOperations;
    questionImage?: string;
  };
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

interface FormValues {
  topAnswer: string[];
  answerQuotient: string | string[];
  answerRemainder: string | string[];
  resultAnswer: string[];
  row1Answers: string[];
  row2Answers: string[];
  questionType: QuestionType;
  fibAnswer: string;
  mcqAnswer: string;
  questionId: string;
  answerIntermediate: any;
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
    console.log(formik.errors);
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
        {question.questionType === QuestionType.GRID_1 &&
          question.operation !== ArithmaticOperations.DIVISION && (
            <>
              {/* Top labels */}
              <div className='flex justify-center self-end'>
                {['U', 'T', 'H', 'Th', 'TTh', 'L']
                  .slice(0, String(question.answers?.result)?.length || 1)
                  .reverse()
                  .map((label, index) => (
                    <div
                      key={index}
                      className='w-[46px] mr-[.35rem] p-2 text-[#A5A5A5] text-center flex items-center justify-center font-bold text-[20px]'
                    >
                      {label}
                    </div>
                  ))}
              </div>

              {/* Top answer inputs */}
              {answers?.isPrefil && (
                <div className='flex justify-end space-x-2 self-end'>
                  {formik.values?.topAnswer?.map((char, index) => (
                    <div key={`top-${index}`}>
                      {char === '#' ? (
                        <div className='w-[46px] h-[61px]' /> // Render blank space
                      ) : (
                        <input
                          type='text'
                          name={`topAnswer.${index}`}
                          onFocus={() =>
                            setActiveField(
                              `topAnswer.${index}` as keyof FormValues
                            )
                          }
                          autoComplete='off'
                          value={char}
                          onChange={formik.handleChange}
                          maxLength={
                            question.operation ===
                            ArithmaticOperations.SUBTRACTION
                              ? 2
                              : 1
                          } // Allow multiple digits for subtraction
                          className={cx(
                            'border-2 border-gray-900 rounded-[10px] p-2 w-[46px] h-[61px] text-center font-bold  focus:outline-none focus:border-primary',
                            question.operation ===
                              ArithmaticOperations.SUBTRACTION
                              ? 'text-[24px]'
                              : 'text-[36px]'
                          )}
                          onKeyPress={(e) => {
                            if (!/[0-9]/.test(e.key)) e.preventDefault(); // Only allow numbers
                          }}
                          onPaste={(e) => {
                            const pasteData = e.clipboardData.getData('text');
                            if (!/^[0-9]*$/.test(pasteData)) {
                              e.preventDefault(); // Prevent paste if it contains non-numeric characters
                            }
                          }}
                          disabled={
                            (question.operation ===
                              ArithmaticOperations.ADDITION &&
                              (answers.answerTop[index] || '') !== '' &&
                              (answers.answerTop[index] || '') !== 'B' &&
                              char === (answers.answerTop[index] || '')) ||
                            (answers.answerTop.split('|')[index] !== '' &&
                              answers.answerTop.split('|')[index] !== 'B' &&
                              char === answers.answerTop.split('|')[index])
                          }
                          // Disable if it matches the initial value
                        />
                      )}

                      {Array.isArray(formik.touched.topAnswer) &&
                        Array.isArray(formik.errors.topAnswer) &&
                        formik.touched.topAnswer[index] &&
                        formik.errors.topAnswer[index] && (
                          <div className='text-red-500 text-xs'>
                            {formik.errors.topAnswer[index]}
                          </div>
                        )}
                    </div>
                  ))}
                  {question.operation === ArithmaticOperations.ADDITION && (
                    <div className='w-12 h-10 flex items-center justify-center font-bold text-[36px]' />
                  )}
                </div>
              )}
              {/* Numbers */}
              <div className='flex flex-col space-y-2 self-end'>
                {Object.keys(numbers).map((key, idx) => (
                  <div key={key} className='flex justify-end space-x-2'>
                    {numbers[key].split('').map((digit, index) => (
                      <div
                        key={index}
                        className='w-[46px] h-10 flex items-center justify-center font-bold text-[36px] relative'
                      >
                        {digit}
                        {question.operation ===
                          ArithmaticOperations.SUBTRACTION &&
                          !!answers.isPrefil &&
                          idx === 0 &&
                          formik.values.topAnswer?.[index] !== '#' && (
                            <div className='absolute inset-0'>
                              <div className='absolute w-full h-0 border-t-4 border-dotted border-red-700 rotate-45 top-1/2 -translate-y-1/2' />
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Separator */}
              <div className='w-full relative'>
                <span className='absolute bottom-4 left-4'>
                  {operationMap[question.operation]}
                </span>
                <hr className='w-full text-black border border-black' />
              </div>

              {/* Intermediate Inputs (Only for Multiplication) */}
              {question.operation === ArithmaticOperations.MULTIPLICATION &&
                answers?.isIntermediatePrefill &&
                !!answers?.answerIntermediate && (
                  <div className='flex flex-col space-y-2 self-end'>
                    {answers?.answerIntermediate
                      .split('#')
                      .map((row, rowIndex) => (
                        <div
                          key={`row-${rowIndex}`}
                          className='flex justify-end space-x-2'
                        >
                          {row.split('').map((char, index) => {
                            // Calculate the flat index for the flattened structure
                            const flatIndex =
                              answers?.answerIntermediate
                                .split('#')
                                .slice(0, rowIndex) // Get rows before the current row
                                .reduce((acc, r) => acc + r.length, 0) + index; // Sum lengths + current index

                            return (
                              <input
                                key={`intermediate-${rowIndex}-${index}`}
                                type='text'
                                name={`answerIntermediate.${flatIndex}`}
                                onFocus={() =>
                                  setActiveField(
                                    `answerIntermediate.${flatIndex}` as keyof FormValues
                                  )
                                }
                                value={
                                  formik.values?.answerIntermediate?.[flatIndex]
                                }
                                autoComplete='off'
                                onChange={formik.handleChange}
                                maxLength={1}
                                className='border-2 border-gray-900 rounded-[10px] p-2 w-[46px] h-[61px] text-center font-bold text-[36px] focus:outline-none focus:border-primary'
                                disabled={char !== 'B' && char !== ''}
                                onKeyPress={(e) => {
                                  if (!/[0-9]/.test(e.key)) e.preventDefault();
                                }}
                                onPaste={(e) => {
                                  const pasteData =
                                    e.clipboardData.getData('text');
                                  if (!/^[0-9]*$/.test(pasteData)) {
                                    e.preventDefault(); // Prevent paste if it contains non-numeric characters
                                  }
                                }}
                              />
                            );
                          })}
                        </div>
                      ))}
                  </div>
                )}

              {/* Separator */}
              {answers?.isIntermediatePrefill && (
                <div className='w-full relative'>
                  <span className='absolute bottom-4 left-4'>
                    {operationMap[ArithmaticOperations.ADDITION]}
                  </span>
                  <hr className='w-full text-black border border-black' />
                </div>
              )}
              {/* Result answer inputs */}
              <div className='flex space-x-2'>
                {Array(
                  maxLength - formik.values?.resultAnswer?.length > 0
                    ? maxLength - formik.values?.resultAnswer?.length
                    : 0
                )
                  .fill(null)
                  .map((_, i) => (
                    <div
                      key={`extra-space-${i}`}
                      className='w-[40px] h-[61px] border-transparent'
                    />
                  ))}
                <div className='w-12 h-10 flex items-center justify-center font-bold text-[36px]' />
                {formik.values?.resultAnswer?.map((value, index) => (
                  <div key={`result-${index}`}>
                    <input
                      type='text'
                      name={`resultAnswer.${index}`}
                      onFocus={() =>
                        setActiveField(
                          `resultAnswer.${index}` as keyof FormValues
                        )
                      }
                      autoFocus
                      autoComplete='off'
                      value={formik.values?.resultAnswer?.[index]}
                      onChange={formik.handleChange}
                      maxLength={1}
                      className='border-2 border-gray-900 rounded-[10px] p-2 w-[46px] h-[61px] text-center font-bold text-[36px] focus:outline-none focus:border-primary'
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) e.preventDefault();
                      }}
                      onPaste={(e) => {
                        const pasteData = e.clipboardData.getData('text');
                        if (!/^[0-9]*$/.test(pasteData)) {
                          e.preventDefault(); // Prevent paste if it contains non-numeric characters
                        }
                      }}
                      disabled={
                        (answers.answerResult[index] || '') !== '' &&
                        (answers.answerResult[index] || '') !== 'B' &&
                        value === (answers.answerResult[index] || '')
                      } // Disable if it matches the initial value
                    />
                    {Array.isArray(formik.touched.resultAnswer) &&
                      Array.isArray(formik.errors.resultAnswer) &&
                      formik.touched.resultAnswer[index] &&
                      formik.errors.resultAnswer[index] && (
                        <div className='text-red-500 text-xs'>
                          {formik.errors.resultAnswer[index]}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </>
          )}

        {question.questionType === QuestionType.GRID_1 &&
          question.operation === ArithmaticOperations.DIVISION && (
            <div className='flex  '>
              {/* Divisor */}
              <div className='flex mt-20 pt-1 pr-4'>
                <div className='flex justify-end'>
                  <div className='w-[46px] h-[61px] text-center font-bold text-[36px] px-2'>
                    {numbers.n2} {/* Display the value of n2 */}
                  </div>
                </div>
              </div>
              <div>
                {/* quotient */}
                <div className='flex mb-4 space-x-4 ml-3'>
                  {(formik.values.answerQuotient as string[])?.map(
                    (value, index) => (
                      <div key={`answerQuotient-${index}`}>
                        <input
                          type='text'
                          name={`answerQuotient.${index}`}
                          onFocus={() =>
                            setActiveField(
                              `answerQuotient.${index}` as keyof FormValues
                            )
                          }
                          value={formik.values?.answerQuotient?.[index] || ''}
                          autoFocus
                          onChange={formik.handleChange}
                          maxLength={1}
                          className='border-2 border-gray-900 rounded-[10px] p-2 w-[46px] h-[61px] text-center font-bold text-[36px] focus:outline-none focus:border-primary'
                          onKeyPress={(e) => {
                            if (!/[0-9]/.test(e.key)) e.preventDefault();
                          }}
                          onPaste={(e) => {
                            const pasteData = e.clipboardData.getData('text');
                            if (!/^[0-9]*$/.test(pasteData)) {
                              e.preventDefault();
                            }
                          }}
                          disabled={
                            (answers.answerQuotient[index] || '') !== '' &&
                            (answers.answerQuotient[index] || '') !== 'B' &&
                            value === (answers.answerQuotient[index] || '')
                          }
                        />
                      </div>
                    )
                  )}
                </div>

                {/* Dividend */}
                <div className='flex border-t-2 border-l-2 border-gray-900 p-2 space-x-3'>
                  {String(numbers.n1)
                    .split('')
                    .map((digit, index) => (
                      <div
                        key={index}
                        className='w-[46px] h-[40px] text-center font-bold text-[36px] px-2'
                      >
                        {digit}
                      </div>
                    ))}
                </div>

                {/* Intermediate Steps and Remainder */}
                <div className='space-y-4'>
                  {renderDivisionIntermediateSteps()}
                </div>

                <div className='flex mt-4 justify-start space-x-3'>
                  {(formik.values.answerRemainder as string[])?.map(
                    (value, index) => {
                      const shouldRenderEmptySpace = value === '#';

                      return shouldRenderEmptySpace ? (
                        <div
                          key={`values-${index}`}
                          className='w-[48px] h-[61px]'
                        />
                      ) : (
                        <input
                          key={`answerRemainder-${index}`}
                          type='text'
                          name={`answerRemainder.${index}`}
                          onFocus={() =>
                            setActiveField(
                              `answerRemainder.${index}` as keyof FormValues
                            )
                          }
                          value={formik.values?.answerRemainder?.[index] || ''}
                          autoFocus
                          autoComplete='off'
                          onChange={formik.handleChange}
                          maxLength={1}
                          className='border-2 border-gray-900 rounded-[10px] p-2 w-[46px] h-[61px] text-center font-bold text-[36px] focus:outline-none focus:border-primary'
                          onKeyDown={(e) => {
                            if (!/[0-9]/.test(e.key) && e.key !== 'Backspace')
                              e.preventDefault();
                          }}
                          onPaste={(e) => {
                            const pasteData = e.clipboardData.getData('text');
                            if (!/^[0-9]*$/.test(pasteData)) e.preventDefault();
                          }}
                        />
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}

        {question.questionType === QuestionType.GRID_2 && (
          <>
            <div className='flex justify-center'>
              <div className='w-[75px] p-4  border border-gray-900 flex items-center justify-center font-bold text-[36px]'>
                {' '}
              </div>
              {Array.from({ length: maxLength }).map((_, index) => (
                <div
                  key={index}
                  className='w-[80px] h-[95px] p-4 border text-[#A5A5A5] border-gray-900 flex items-center justify-center font-bold text-[24px]'
                >
                  {['U', 'T', 'H', 'Th', 'TTh'][maxLength - 1 - index] || ''}
                </div>
              ))}
            </div>
            <div className='flex flex-col !mt-0'>
              <div className='flex'>
                <div className='w-[75px] p-4 border border-gray-900 flex items-center justify-center font-bold text-[36px]'>
                  {' '}
                </div>
                {formik.values?.row1Answers?.map((value, index) => (
                  <div
                    key={`row-1-${index}`}
                    className='border border-gray-900 p-4'
                  >
                    {' '}
                    <input
                      key={`row1-${index}`}
                      type='text'
                      name={`row1Answers.${index}`}
                      onFocus={() =>
                        setActiveField(
                          `row1Answers.${index}` as keyof FormValues
                        )
                      }
                      autoFocus={index === 0}
                      autoComplete='off'
                      value={formik.values?.row1Answers?.[index]}
                      onChange={formik.handleChange}
                      maxLength={1}
                      className='border-2 border-gray-900 rounded-[10px] p-2 w-[46px] h-[61px] text-center font-bold text-[36px] focus:outline-none focus:border-primary'
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) e.preventDefault();
                      }}
                      onPaste={(e) => {
                        const pasteData = e.clipboardData.getData('text');
                        if (!/^[0-9]*$/.test(pasteData)) {
                          e.preventDefault(); // Prevent paste if it contains non-numeric characters
                        }
                      }}
                    />
                    {Array.isArray(formik.touched.row1Answers) &&
                      Array.isArray(formik.errors.row1Answers) &&
                      formik.touched.row1Answers[index] &&
                      formik.errors.row1Answers[index] && (
                        <div className='text-red-500 text-xs'>
                          {formik.errors.row1Answers[index]}
                        </div>
                      )}
                  </div>
                ))}
              </div>

              {/* Row 2 Inputs */}
              <div className='flex'>
                <div className='w-[75px] border border-gray-900 p-4 flex items-center justify-center font-bold text-[36px]'>
                  {operationMap[question.operation]}
                </div>
                {formik.values?.row2Answers?.map((value, index) => (
                  <div
                    key={`row-2-${index}`}
                    className='border border-gray-900 p-4'
                  >
                    <input
                      key={`row2-${index}`}
                      type='text'
                      name={`row2Answers.${index}`}
                      onFocus={() =>
                        setActiveField(
                          `row2Answers.${index}` as keyof FormValues
                        )
                      }
                      value={formik.values?.row2Answers?.[index]}
                      onChange={formik.handleChange}
                      autoComplete='off'
                      maxLength={1}
                      className='border-2 border-gray-900 rounded-[10px] p-2 w-[46px] h-[61px] text-center font-bold text-[36px] focus:outline-none focus:border-primary'
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) e.preventDefault();
                      }}
                      onPaste={(e) => {
                        const pasteData = e.clipboardData.getData('text');
                        if (!/^[0-9]*$/.test(pasteData)) {
                          e.preventDefault(); // Prevent paste if it contains non-numeric characters
                        }
                      }}
                    />
                    {Array.isArray(formik.touched.row2Answers) &&
                      Array.isArray(formik.errors.row2Answers) &&
                      formik.touched.row2Answers[index] &&
                      formik.errors.row2Answers[index] && (
                        <div className='text-red-500 text-xs'>
                          {formik.errors.row2Answers[index]}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {question.questionType === QuestionType.FIB &&
          (question.operation === ArithmaticOperations.DIVISION &&
          answers.fib_type === '2' ? (
            <div className='flex flex-col  items-center justify-center  relative'>
              <p className='text-4xl font-semibold text-headingTextColor  pt-[23px] pb-[22px] px-[7px]'>
                {Object.values(question?.numbers || {}).join(
                  operationMap[question.operation]
                )}
                =
              </p>
              <div className='flex flex-col space-y-5 mt-8'>
                <div className='flex justify-between items-center'>
                  <h1 className='text-gray-900'>Quotient</h1>
                  <input
                    type='text'
                    name='answerQuotient'
                    onFocus={() => setActiveField('answerQuotient')}
                    autoFocus
                    autoComplete='off'
                    value={formik.values.answerQuotient}
                    onChange={formik.handleChange}
                    maxLength={9}
                    onKeyPress={(e) => {
                      // Prevent non-numeric key presses
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const pasteData = e.clipboardData.getData('text');
                      if (!/^[0-9]*$/.test(pasteData)) {
                        e.preventDefault(); // Prevent paste if it contains non-numeric characters
                      }
                    }}
                    className='border-2 border-gray-900 rounded-[10px] p-2 w-[236px] h-[61px] text-center font-bold text-[36px] focus:outline-none focus:border-primary'
                  />
                </div>

                <div className='flex justify-between items-center space-x-6'>
                  <h1 className='text-gray-900'>Remainder</h1>
                  <input
                    type='text'
                    name='answerRemainder'
                    onFocus={() => setActiveField('answerRemainder')}
                    autoFocus
                    autoComplete='off'
                    value={formik.values.answerRemainder}
                    onChange={formik.handleChange}
                    maxLength={9}
                    onKeyPress={(e) => {
                      // Prevent non-numeric key presses
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const pasteData = e.clipboardData.getData('text');
                      if (!/^[0-9]*$/.test(pasteData)) {
                        e.preventDefault(); // Prevent paste if it contains non-numeric characters
                      }
                    }}
                    className='border-2 border-gray-900 rounded-[10px] p-2 w-[236px] h-[61px] text-center font-bold text-[36px] focus:outline-none focus:border-primary'
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className='flex flex-row items-center justify-center relative'>
              <p className='text-4xl flex flex-row font-semibold text-headingTextColor ml-[60px] pt-[23px] pb-[22px] px-[7px]'>
                {Object.values(question?.numbers || {}).join(
                  operationMap[question.operation]
                )}
                =
              </p>
              <div className='flex flex-col space-y-2 w-[236px]'>
                <input
                  type='text'
                  name='fibAnswer'
                  onFocus={() => setActiveField(`fibAnswer`)}
                  autoFocus
                  autoComplete='off'
                  value={formik.values.fibAnswer}
                  onChange={formik.handleChange}
                  maxLength={9}
                  onKeyPress={(e) => {
                    // Prevent non-numeric key presses
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    const pasteData = e.clipboardData.getData('text');
                    if (!/^[0-9]*$/.test(pasteData)) {
                      e.preventDefault(); // Prevent paste if it contains non-numeric characters
                    }
                  }}
                  className='border-2 border-gray-900 rounded-[10px] p-2 w-full h-[61px] text-center font-bold text-[36px] focus:outline-none focus:border-primary'
                />

                {formik.touched.fibAnswer &&
                  formik.touched.answerRemainder &&
                  formik.touched.answerQuotient &&
                  formik.errors.answerQuotient &&
                  formik.errors.answerRemainder &&
                  formik.errors.fibAnswer && (
                    <div className='text-red-500 text-xs absolute -bottom-2'>
                      {formik.errors.fibAnswer &&
                        formik.errors.answerQuotient &&
                        formik.errors.answerRemainder}
                    </div>
                  )}
              </div>
            </div>
          ))}

        {question.questionType === QuestionType.MCQ && !!question.options && (
          <div className='flex flex-col space-y-2 justify-center items-center'>
            <MultiLangText
              labelMap={question?.name}
              component='span'
              className='mb-6'
            />
            {question?.questionImage && imgLoading && !imgError && <Loader />}
            {question?.questionImage && !!imgURL && !imgError ? (
              <img
                key={imgURL}
                className='w-auto min-w-[30%] max-w-full h-auto max-h-[80vh] !mb-6 object-contain'
                src={imgURL}
                onLoad={handleImageLoad}
                onError={() => setImgError(true)}
                alt='Img'
              />
            ) : (
              imgError && (
                <div className='text-red-500 text-lg pb-10 mt-0'>
                  Connectivity Error!! Unable to load the image.
                </div>
              )
            )}
            <ToggleButtonGroup
              selectedValue={formik.values.mcqAnswer}
              setSelectedValue={(val) => formik.setFieldValue('mcqAnswer', val)}
              options={question.options}
            />
            {formik.touched.mcqAnswer && formik.errors.mcqAnswer && (
              <div className='text-red-500 text-xs'>
                {formik.errors.mcqAnswer}
              </div>
            )}
          </div>
        )}
      </form>
    );
  }
);

export default Question;
