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
import AmlInput from './AmlInput';

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

  const shouldRenderDivisionFIB =
    question.operation === ArithmaticOperations.DIVISION &&
    answers.fib_type === '2';

  const handleSetField = (fieldName: keyof FormValues) => () => {
    setActiveField(fieldName);
  };

  return (
    <div>
      {shouldRenderDivisionFIB && (
        <div className='flex flex-col items-center justify-center relative'>
          <p className='text-4xl font-semibold text-headingTextColor pt-[23px] pb-[22px] px-[7px]'>
            {Object.values(question?.numbers || {}).join(
              operationMap[question.operation]
            )}
            =
          </p>
          <div className='flex flex-col space-y-5 mt-8'>
            <div className='flex justify-between items-center'>
              <h1 className='text-gray-900'>Quotient</h1>
              <AmlInput
                name='answerQuotient'
                autoFocus
                maxLength={9}
                onChange={formik.handleChange}
                onFocus={handleSetField('answerQuotient')}
                value={formik.values.answerQuotient}
                className='!w-[236px]'
              />
            </div>

            <div className='flex justify-between items-center space-x-6'>
              <h1 className='text-gray-900'>Remainder</h1>
              <AmlInput
                name='answerRemainder'
                onFocus={handleSetField('answerRemainder')}
                value={formik.values.answerRemainder}
                onChange={formik.handleChange}
                maxLength={9}
                className='!w-[236px]'
              />
            </div>
          </div>
        </div>
      )}
      {!shouldRenderDivisionFIB && (
        <div className='flex flex-row items-center justify-center relative'>
          <p className='text-4xl flex flex-row font-semibold text-headingTextColor ml-[60px] pt-[23px] pb-[22px] px-[7px]'>
            {Object.values(question?.numbers || {}).join(
              operationMap[question.operation]
            )}
            =
          </p>
          <div className='flex flex-col space-y-2 w-[236px]'>
            <AmlInput
              name='fibAnswer'
              onFocus={handleSetField('fibAnswer')}
              autoFocus
              value={formik.values.fibAnswer}
              onChange={formik.handleChange}
              maxLength={9}
              className='!w-full'
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FIBQuestion;
