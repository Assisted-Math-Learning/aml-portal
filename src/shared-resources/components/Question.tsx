/* eslint-disable func-names, react/no-this-in-sfc,  no-unsafe-optional-chaining */
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
import { currentImageURLSelector } from 'store/selectors/media.selector';
import ToggleButtonGroup from './ToggleButtonGroup/ToggleButtonGroup';
import Loader from './Loader/Loader';

interface QuestionProps {
  question: {
    answers: {
      result: string;
      isPrefil: boolean;
      answerTop: string;
      answerResult: string;
    };
    numbers: {
      [key: string]: string;
    };
    questionType: QuestionType;
    questionId: string;
    options?: string[];
    name?: { en: string };
    questionImage?: string;
  };
  onSubmit: (gridData: any) => void;
  onValidityChange: (validity: boolean) => void;
}

interface FormValues {
  topAnswer: string[];
  resultAnswer: string[];
  row1Answers: string[];
  row2Answers: string[];
  questionType: QuestionType;
  fibAnswer: string;
  mcqAnswer: string;
  questionId: string;
}

// Using forwardRef to forward refs to the parent component
const Question = forwardRef(
  ({ question, onSubmit, onValidityChange }: QuestionProps, ref) => {
    const { answers, numbers, questionImage } = question;
    const dispatch = useDispatch();
    const currentImageURL = useSelector(currentImageURLSelector);
    const [imgURL, setImageURL] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [imgLoading, setImageLoading] = useState<boolean>(true);
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
              return /^\d$/.test(value) || value === '#'; // Valid when it's a digit or #
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
            if (questionType === QuestionType.FIB) {
              return !!value; // Return true if value is provided
            }
            return true; // Skip validation if not 'fib'
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
        topAnswer: answers?.answerTop
          ?.split('')
          ?.map((val) => (val === 'B' ? '' : val)),
        resultAnswer: answers?.answerResult
          ?.split('')
          ?.map((val) => (val === 'B' ? '' : val)),
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
            fibAnswer: values.fibAnswer, // Pass the FIB answer
          });
        } else if (question.questionType === QuestionType.MCQ) {
          onSubmit({
            questionId: question.questionId,
            mcqAnswer: values.mcqAnswer, // Pass the FIB answer
          });
        }
        // Reset the form
        formik.resetForm();
      },
    });

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
      setImageLoading(true);
    }, [question]);

    useEffect(() => {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }, [question]);

    return isLoading ? (
      <Loader />
    ) : (
      <form
        onSubmit={formik.handleSubmit}
        className='flex flex-col space-y-4 items-start'
      >
        {question.questionType === QuestionType.GRID_1 && (
          <>
            {/* Top labels */}
            <div className='flex justify-center self-end'>
              {Array.from({
                length: question.answers?.answerTop?.length - 1,
              }).map((_, index) => (
                <div
                  key={index}
                  className='w-[46px] mr-2 p-2 text-[#A5A5A5] text-center flex items-center justify-center font-bold text-[20px]'
                >
                  {['U', 'T', 'H', 'Th', 'TTh', 'L'][
                    question.answers?.answerTop?.length - index
                  ] || ''}
                </div>
              ))}
              <div className='w-[46px] p-2 text-[#A5A5A5] text-center flex items-center justify-center font-bold text-[20px]'>
                U
              </div>
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
                        autoComplete='off'
                        value={char === 'B' ? '' : char} // If 'B', keep input empty
                        onChange={formik.handleChange}
                        maxLength={1}
                        className='border-2 border-gray-900 rounded-[10px] p-2 w-[46px] h-[61px] text-center font-bold text-[36px] focus:outline-none focus:border-primary'
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
                          (answers.answerTop[index] || '') !== '' &&
                          (answers.answerTop[index] || '') !== 'B' &&
                          char === (answers.answerTop[index] || '')
                        } // Disable if it matches the initial value
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
                <div className='w-12 h-10 flex items-center justify-center font-bold text-[36px]' />
              </div>
            )}
            {/* Numbers */}
            <div className='flex flex-col space-y-2 self-end'>
              {Object.keys(numbers).map((key, idx) => (
                <div key={key} className='flex justify-end space-x-2'>
                  {numbers[key].split('').map((digit, index) => (
                    <div
                      key={index}
                      className='w-[46px] h-10 flex items-center justify-center font-bold text-[36px]'
                    >
                      {digit}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Separator */}
            <div className='w-full relative'>
              <span className='absolute bottom-4 left-4'>+</span>
              <hr className='w-full text-black border border-black' />
            </div>
            {/* Result answer inputs */}
            <div className='flex space-x-2'>
              <div className='w-12 h-10 flex items-center justify-center font-bold text-[36px]' />
              {formik.values?.resultAnswer?.map((value, index) => (
                <div key={`result-${index}`}>
                  <input
                    type='text'
                    name={`resultAnswer.${index}`}
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
                  +
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

        {question.questionType === QuestionType.FIB && (
          <div className='flex flex-row items-center justify-center relative'>
            <p className='text-4xl flex flex-row font-semibold text-headingTextColor ml-[60px] pt-[23px] pb-[22px] px-[7px]'>
              {Object.values(question?.numbers || {}).join(' + ')}=
            </p>
            <div className='flex flex-col space-y-2 w-[236px]'>
              <input
                type='text'
                name='fibAnswer'
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
              {formik.touched.fibAnswer && formik.errors.fibAnswer && (
                <div className='text-red-500 text-xs absolute -bottom-2'>
                  {formik.errors.fibAnswer}
                </div>
              )}
            </div>
          </div>
        )}

        {question.questionType === QuestionType.MCQ && !!question.options && (
          <div className='flex flex-col space-y-2 justify-center items-center'>
            <span className='mb-6'>{question?.name?.en}</span>
            {question?.questionImage && imgLoading && <Loader />}
            {question?.questionImage && !!imgURL && (
              <img
                key={imgURL}
                className='w-auto min-w-[30%] max-w-full h-auto max-h-[80vh] !mb-6 object-contain'
                src={imgURL}
                onLoad={handleImageLoad}
                alt='Img'
              />
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
