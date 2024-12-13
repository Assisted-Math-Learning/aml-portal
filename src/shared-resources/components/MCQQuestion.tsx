/* eslint-disable func-names, react/no-this-in-sfc,  no-unsafe-optional-chaining, no-lonely-if, jsx-a11y/no-autofocus */
import React from 'react';
import { FormikProps } from 'formik';
import {
  FormValues,
  QuestionPropsType,
} from 'shared-resources/components/questionUtils';
import Loader from './Loader/Loader';
import MultiLangText from './MultiLangText/MultiLangText';
import ToggleButtonGroup from './ToggleButtonGroup/ToggleButtonGroup';

interface MCQQuestionProps {
  question: QuestionPropsType;
  imgLoading: boolean;
  imgURL: string | null;
  imgError: boolean;
  handleImageLoad: () => void;
  setImgError: React.Dispatch<React.SetStateAction<boolean>>;
  formik: FormikProps<FormValues>;
}

const MCQQuestion: React.FC<MCQQuestionProps> = (props: MCQQuestionProps) => {
  const {
    question,
    imgLoading,
    imgURL,
    imgError,
    handleImageLoad,
    setImgError,
    formik,
  } = props;

  return (
    <div>
      {!!question.options && (
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
    </div>
  );
};

export default MCQQuestion;
