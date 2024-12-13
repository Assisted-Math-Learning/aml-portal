/* eslint-disable func-names, react/no-this-in-sfc,  no-unsafe-optional-chaining, no-lonely-if, jsx-a11y/no-autofocus, react/jsx-no-useless-fragment */
import React from 'react';
import cx from 'classnames';
import { FormikProps } from 'formik';
import {
  ArithmaticOperations,
  operationMap,
} from 'models/enums/ArithmaticOperations.enum';

import {
  FormValues,
  QuestionPropsType,
} from 'shared-resources/components/questionUtils';
import Grid1DivisionQuestion from './Grid1DivisionQuestion';

interface Grid1QuestionProps {
  question: QuestionPropsType;
  maxLength: number;
  formik: FormikProps<FormValues>;
  setActiveField: React.Dispatch<React.SetStateAction<keyof FormValues | null>>;
}

const Grid1Question = ({
  question,
  formik,
  setActiveField,
  maxLength,
}: Grid1QuestionProps) => {
  const { answers, numbers } = question;

  return (
    <>
      {question.operation === ArithmaticOperations.DIVISION ? (
        <Grid1DivisionQuestion
          formik={formik}
          question={question}
          setActiveField={setActiveField}
        />
      ) : (
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
                        setActiveField(`topAnswer.${index}` as keyof FormValues)
                      }
                      autoComplete='off'
                      value={char}
                      onChange={formik.handleChange}
                      maxLength={
                        question.operation === ArithmaticOperations.SUBTRACTION
                          ? 2
                          : 1
                      } // Allow multiple digits for subtraction
                      className={cx(
                        'border-2 border-gray-900 rounded-[10px] p-2 w-[46px] h-[61px] text-center font-bold  focus:outline-none focus:border-primary',
                        question.operation === ArithmaticOperations.SUBTRACTION
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
                        (question.operation === ArithmaticOperations.ADDITION &&
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
                    {question.operation === ArithmaticOperations.SUBTRACTION &&
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
                {answers?.answerIntermediate.split('#').map((row, rowIndex) => (
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
                          value={formik.values?.answerIntermediate?.[flatIndex]}
                          autoComplete='off'
                          onChange={formik.handleChange}
                          maxLength={1}
                          className='border-2 border-gray-900 rounded-[10px] p-2 w-[46px] h-[61px] text-center font-bold text-[36px] focus:outline-none focus:border-primary'
                          disabled={char !== 'B' && char !== ''}
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
                    setActiveField(`resultAnswer.${index}` as keyof FormValues)
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
    </>
  );
};
export default Grid1Question;
