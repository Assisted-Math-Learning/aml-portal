/* eslint-disable func-names, react/no-this-in-sfc,  no-unsafe-optional-chaining, no-lonely-if, jsx-a11y/no-autofocus */
import React from 'react';
import { FormikProps } from 'formik';
import {
  FormValues,
  QuestionPropsType,
} from 'shared-resources/components/questionUtils';
import { useImageLoader } from 'hooks/useImageLoader';
import MultiLangText from './MultiLangText/MultiLangText';
import ToggleButtonGroup from './ToggleButtonGroup/ToggleButtonGroup';
import { ImageRenderer } from './ImageRenderer';

interface MCQQuestionProps {
  question: QuestionPropsType;
  formik: FormikProps<FormValues>;
}

const MCQQuestion: React.FC<MCQQuestionProps> = (props: MCQQuestionProps) => {
  const { question, formik } = props;

  const {
    isImageLoading,
    isImageReady,
    imgError,
    handleImageLoad,
    setImgError,
  } = useImageLoader(question?.questionImageUrl);

  return (
    <div>
      {!!question.options && (
        <div className='flex flex-col space-y-2 justify-center items-center'>
          <MultiLangText
            labelMap={question?.name}
            component='span'
            className='mb-6'
          />

          <ImageRenderer
            imageUrl={question.questionImageUrl || ''}
            isImageLoading={isImageLoading}
            isImageReady={isImageReady}
            imgError={imgError}
            onImageLoad={handleImageLoad}
            onImageError={() => setImgError(true)}
          />
          <ToggleButtonGroup
            selectedValue={formik.values.mcqAnswer}
            setSelectedValue={(val) => formik.setFieldValue('mcqAnswer', val)}
            options={question.options}
          />
        </div>
      )}
    </div>
  );
};

export default MCQQuestion;
