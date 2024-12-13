/* eslint-disable func-names, react/no-this-in-sfc,  no-unsafe-optional-chaining, no-lonely-if, jsx-a11y/no-autofocus, react/jsx-no-useless-fragment */
import React from 'react';
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
  formik: FormikProps<FormValues>;
  setActiveField: React.Dispatch<React.SetStateAction<keyof FormValues | null>>;
}

const Grid1DivisionQuestion = ({
  question,
  formik,
  setActiveField,
}: Grid1QuestionProps) => {
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
              {operationMap[ArithmaticOperations.SUBTRACTION]}
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
                {operationMap[ArithmaticOperations.SUBTRACTION]}
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
      {question.operation === ArithmaticOperations.DIVISION && (
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
            <div className='space-y-4'>{renderDivisionIntermediateSteps()}</div>

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
      )}
    </>
  );
};
export default Grid1DivisionQuestion;
