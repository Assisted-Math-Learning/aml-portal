/* eslint-disable func-names, react/no-this-in-sfc,  no-unsafe-optional-chaining, no-lonely-if, jsx-a11y/no-autofocus */
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

interface FIBQuestionProps {
  question: QuestionPropsType;

  formik: FormikProps<FormValues>;
  setActiveField: React.Dispatch<React.SetStateAction<keyof FormValues | null>>;
}

const FIBQuestion = ({
  question,
  formik,
  setActiveField,
}: FIBQuestionProps) => {
  const { answers } = question;

  return (
    <div>
      {question.operation === ArithmaticOperations.DIVISION &&
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
      )}
    </div>
  );
};
export default FIBQuestion;
