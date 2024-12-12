/* eslint-disable func-names, react/no-this-in-sfc,  no-unsafe-optional-chaining, no-lonely-if, jsx-a11y/no-autofocus, react/jsx-no-useless-fragment */
import React, { forwardRef } from 'react';
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

interface Grid1QuestionProps {
  question: QuestionPropsType;
  maxLength: number;
  formik: FormikProps<FormValues>;
  setActiveField: React.Dispatch<React.SetStateAction<keyof FormValues | null>>;
}

// Using forwardRef to forward refs to the parent component
const Grid1Question = forwardRef(
  (
    { question, formik, setActiveField, maxLength }: Grid1QuestionProps,
    ref
  ) => {
    const { answers, numbers } = question;

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
    return (
      <>
        {question.operation === ArithmaticOperations.DIVISION ? (
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
              <div className='flex mb-4 space-x-4 ml-2'>
                {Array.isArray(formik.values.answerQuotient) &&
                  (formik.values?.answerQuotient as string[])?.map(
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

              <div className='flex mt-4 justify-start space-x-4'>
                {Array.isArray(formik.values.answerRemainder) &&
                  (formik.values.answerRemainder as string[])?.map(
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
      </>
    );
  }
);

export default Grid1Question;
