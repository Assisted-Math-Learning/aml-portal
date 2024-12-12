/* eslint-disable func-names, react/no-this-in-sfc,  no-unsafe-optional-chaining, no-lonely-if, jsx-a11y/no-autofocus */
import React from 'react';
import { FormikProps } from 'formik';
import { operationMap } from 'models/enums/ArithmaticOperations.enum';
import {
  FormValues,
  QuestionPropsType,
} from 'shared-resources/components/questionUtils';

interface Grid2QuestionProps {
  question: QuestionPropsType;
  maxLength: number;
  formik: FormikProps<FormValues>;
  setActiveField: React.Dispatch<React.SetStateAction<keyof FormValues | null>>;
}

const Grid2Question: React.FC<Grid2QuestionProps> = (
  props: Grid2QuestionProps
) => {
  const { question, setActiveField, maxLength, formik } = props;

  return (
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
            <div key={`row-1-${index}`} className='border border-gray-900 p-4'>
              {' '}
              <input
                key={`row1-${index}`}
                type='text'
                name={`row1Answers.${index}`}
                onFocus={() =>
                  setActiveField(`row1Answers.${index}` as keyof FormValues)
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
            <div key={`row-2-${index}`} className='border border-gray-900 p-4'>
              <input
                key={`row2-${index}`}
                type='text'
                name={`row2Answers.${index}`}
                onFocus={() =>
                  setActiveField(`row2Answers.${index}` as keyof FormValues)
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
  );
};

export default Grid2Question;
