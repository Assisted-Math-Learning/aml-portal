/* eslint-disable func-names, react/no-this-in-sfc,  no-unsafe-optional-chaining, no-lonely-if, jsx-a11y/no-autofocus */
import React from 'react';
import { FormikProps } from 'formik';
import {
  ArithmaticOperations,
  operationMap,
} from 'models/enums/ArithmaticOperations.enum';

import {
  FormValues,
  isFieldAnswerValid,
  QuestionPropsType,
} from 'shared-resources/components/questionUtils';
import cn from 'classnames';
import AmlInput from './AmlInput';

interface Grid1QuestionProps {
  errors: {
    [key: string]: boolean[] | boolean[][];
  };
  question: QuestionPropsType;
  formik: FormikProps<FormValues>;
  setActiveField: React.Dispatch<React.SetStateAction<keyof FormValues | null>>;
  showErrors: boolean;
}

const Grid1DivisionQuestion = ({
  errors = {},
  question,
  formik,
  setActiveField,
  showErrors,
}: Grid1QuestionProps) => {
  const { answers, numbers } = question;

  const renderDivisor = () => (
    <div className='flex mt-20 pt-1 pr-4'>
      <div className='flex justify-end'>
        <div className='w-[46px] h-[61px] text-center font-bold text-[36px] px-2'>
          {numbers.n2} {/* Display the value of n2 */}
        </div>
      </div>
    </div>
  );
  const renderQuotient = () => (
    <div className='flex mb-4 space-x-3 ml-2'>
      {Array.isArray(formik.values.answerQuotient) &&
        (formik.values?.answerQuotient as string[])?.map((value, index) => {
          const isDisabled =
            isFieldAnswerValid('answerQuotient', index, answers) &&
            value === (answers.answerQuotient[index] || '');

          return (
            <div key={`answerQuotient-${index}`}>
              <AmlInput
                name={`answerQuotient.${index}`}
                onFocus={() =>
                  setActiveField(`answerQuotient.${index}` as keyof FormValues)
                }
                value={formik.values?.answerQuotient?.[index] || ''}
                autoFocus
                onChange={formik.handleChange}
                className={cn(
                  showErrors &&
                    (errors.answerQuotient && errors.answerQuotient[index]
                      ? 'showWrongInput'
                      : 'showCorrectInput')
                )}
                disabled={isDisabled}
              />
            </div>
          );
        })}
    </div>
  );

  const renderDividend = () => (
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
  );

  const renderRemainder = () => (
    <div className='flex mt-4 justify-start space-x-3 ml-2.5'>
      {Array.isArray(formik.values.answerRemainder) &&
        (formik.values.answerRemainder as string[])?.map((value, index) => {
          const shouldRenderEmptySpace = value === '#';

          if (shouldRenderEmptySpace) {
            return (
              <div key={`values-${index}`} className='w-[46px] h-[61px]' />
            );
          }

          return (
            <AmlInput
              key={`answerRemainder-${index}`}
              name={`answerRemainder.${index}`}
              onFocus={() =>
                setActiveField(`answerRemainder.${index}` as keyof FormValues)
              }
              value={formik.values?.answerRemainder?.[index] || ''}
              onChange={formik.handleChange}
              className={cn(
                showErrors &&
                  (errors.answerRemainder && errors.answerRemainder[index]
                    ? 'showWrongInput'
                    : 'showCorrectInput')
              )}
            />
          );
        })}
    </div>
  );

  const renderDivisionIntermediateSteps = () => {
    const parts = answers.answerIntermediate.split('|');
    return parts.map((stepGroup, idx) => {
      const steps = stepGroup.split('');
      const inputBoxes = steps.map((step, stepIdx) => {
        const isEditable = step === 'B';
        const isBlank = step === '#';

        // Common logic for determining if an index is even and step is a number or 'B'
        const isEvenAndNumberOrBlank = (_step: string, _idx: number) =>
          (_step === 'B' || /[0-9]/.test(_step)) && _idx % 2 === 0;

        // Determine if a dash should be rendered at this step
        const renderMinusSign =
          isEvenAndNumberOrBlank(step, idx) &&
          stepIdx === 0 &&
          !steps.includes('#');

        // Determine if `#` should be a `-`
        const shouldRenderDash =
          isBlank && isEvenAndNumberOrBlank(steps[stepIdx + 1], idx);
        if (shouldRenderDash) {
          return (
            <div
              key={`${idx}-${stepIdx}`}
              className='w-[46px] h-[61px] text-center font-bold text-[36px]'
            >
              {operationMap[ArithmaticOperations.SUBTRACTION]}
            </div>
          );
        }

        // Render empty space for other `#` characters
        if (isBlank) {
          return (
            <div key={`${idx}-${stepIdx}`} className='w-[46px] h-[61px]' />
          );
        }

        const isInputIncorrect = (errors.answerIntermediate as boolean[][])?.[
          idx
        ]?.[stepIdx];

        // Render the input box or static value
        return (
          <div key={`${idx}-${stepIdx}`} className='relative'>
            {((idx === 0 && stepIdx === 0) || renderMinusSign) && (
              <div className='absolute left-[-30px] top-1/2 transform -translate-y-1/2 font-bold text-[36px]'>
                {operationMap[ArithmaticOperations.SUBTRACTION]}
              </div>
            )}

            <AmlInput
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
              className={cn(
                showErrors &&
                  (isInputIncorrect ? 'showWrongInput' : 'showCorrectInput')
              )}
              disabled={!isEditable}
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
    <div className='flex'>
      {/* Render the Divisor */}
      {renderDivisor()}

      <div>
        {/* Render the Quotient */}
        {renderQuotient()}

        {/* Render the Dividend */}
        {renderDividend()}

        {/* Render Intermediate Steps and Remainder */}
        <div className='space-y-4'>{renderDivisionIntermediateSteps()}</div>

        {/* Render the Remainder */}
        {renderRemainder()}
      </div>
    </div>
  );
};

export default Grid1DivisionQuestion;
