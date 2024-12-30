/* eslint-disable func-names, react/no-this-in-sfc,  no-unsafe-optional-chaining, no-lonely-if, jsx-a11y/no-autofocus */
import React from 'react';
import { FormikProps } from 'formik';
import { operationMap } from 'models/enums/ArithmaticOperations.enum';
import {
  FormValues,
  QuestionPropsType,
} from 'shared-resources/components/questionUtils';
import { DIGIT_PLACES } from 'constant/constants';
import cn from 'classnames';
import AmlInput from './AmlInput';

interface Grid2QuestionProps {
  question: QuestionPropsType;
  maxLength: number;
  formik: FormikProps<FormValues>;
  setActiveField: React.Dispatch<React.SetStateAction<keyof FormValues | null>>;
  showErrors: boolean;
  errors: {
    [key: string]: boolean[] | boolean[][];
  };
}

const Grid2Question: React.FC<Grid2QuestionProps> = (
  props: Grid2QuestionProps
) => {
  const { question, setActiveField, maxLength, formik, errors, showErrors } =
    props;

  const row1Errors = Array(maxLength - (errors.row1Answers?.length ?? 0))
    .fill(false)
    .concat(errors.row1Answers ?? []);

  const row2Errors = Array(maxLength - (errors.row2Answers?.length ?? 0))
    .fill(false)
    .concat(errors.row2Answers ?? []);

  return (
    <>
      <div className='flex justify-center'>
        <div className='w-[75px] p-4  border border-gray-900 flex items-center justify-center font-bold text-[36px]' />
        {Array.from({ length: maxLength }).map((_, index) => (
          <div
            key={index}
            className='w-[80px] h-[95px] p-4 border text-digitTextColor border-gray-900 flex items-center justify-center font-bold text-[24px]'
          >
            {DIGIT_PLACES[maxLength - 1 - index] || ''}
          </div>
        ))}
      </div>
      <div className='flex flex-col !mt-0'>
        <div className='flex'>
          <div className='w-[75px] p-4 border border-gray-900 flex items-center justify-center font-bold text-[36px]' />
          {formik.values?.row1Answers?.map((value, index) => (
            <div key={`row-1-${index}`} className='border border-gray-900 p-4'>
              <AmlInput
                key={`row1-${index}`}
                name={`row1Answers.${index}`}
                onFocus={() =>
                  setActiveField(`row1Answers.${index}` as keyof FormValues)
                }
                autoFocus={index === 0}
                value={formik.values?.row1Answers?.[index] === '#' ? '' : value}
                onChange={formik.handleChange}
                className={cn(
                  showErrors &&
                    (row1Errors[index] ? 'showWrongInput' : 'showCorrectInput')
                )}
              />
            </div>
          ))}
        </div>

        {/* Row 2 Inputs */}
        <div className='flex'>
          <div className='w-[75px] border border-gray-900 p-4 flex items-center justify-center font-bold text-[36px]'>
            {operationMap[question.operation]}
          </div>
          {formik.values?.row2Answers?.map((value, index) => (
            <div key={`row-2-${index}`} className='border border-gray-900 p-4'>
              <AmlInput
                key={`row2-${index}`}
                name={`row2Answers.${index}`}
                onFocus={() =>
                  setActiveField(`row2Answers.${index}` as keyof FormValues)
                }
                value={formik.values?.row2Answers?.[index] === '#' ? '' : value}
                onChange={formik.handleChange}
                className={cn(
                  showErrors &&
                    (row2Errors[index] ? 'showWrongInput' : 'showCorrectInput')
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Grid2Question;
