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
  setQuestionFeedback: () => void;
  showErrors: boolean;
  isAnswerIncorrect: boolean;
}

const MCQQuestion: React.FC<MCQQuestionProps> = (props: MCQQuestionProps) => {
  const {
    question,
    formik,
    setQuestionFeedback,
    showErrors,
    isAnswerIncorrect,
  } = props;

  const {
    isImageLoading,
    isImageReady,
    imgError,
    handleImageLoad,
    setImgError,
  } = useImageLoader(question?.questionImageUrl);

  const styles = {
    backgroundColor: isAnswerIncorrect
      ? '#DDA886 !important'
      : '#87B0AB !important',
    color: 'black !important',
    borderColor: isAnswerIncorrect
      ? '#B64D1D !important'
      : '#3F605B !important',
    borderStyle: 'solid !important',
  };

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
            setSelectedValue={(val) => {
              setQuestionFeedback();
              formik.setFieldValue('mcqAnswer', val);
            }}
            options={question.options}
            styles={showErrors ? styles : {}}
          />
        </div>
      )}
    </div>
  );
};

export default MCQQuestion;
