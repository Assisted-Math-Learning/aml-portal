/* eslint-disable func-names, react/no-this-in-sfc,  no-unsafe-optional-chaining, no-lonely-if, jsx-a11y/no-autofocus */
import React, { useEffect, useState } from 'react';
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
  formik: FormikProps<FormValues>;
}

const MCQQuestion: React.FC<MCQQuestionProps> = (props: MCQQuestionProps) => {
  const { question, formik } = props;
  const [imgLoading, setImageLoading] = useState<boolean>(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
    setImageLoading(true);
  }, [question]);

  const handleImageLoad = () => {
    // Using setTimeout to delay imgLoading state update, ensuring it occurs after the current render cycle.
    // This avoids the onLoad event firing before imgLoading is set, preventing the loader from staying permanently.
    setTimeout(() => {
      setImageLoading(false);
    });
  };

  const isImageLoading = question?.questionImageUrl && imgLoading && !imgError;
  const isImageReady =
    question?.questionImageUrl && !!question.questionImageUrl && !imgError;

  return (
    <div>
      {!!question.options && (
        <div className='flex flex-col space-y-2 justify-center items-center'>
          <MultiLangText
            labelMap={question?.name}
            component='span'
            className='mb-6'
          />

          {isImageLoading && <Loader />}
          {isImageReady ? (
            <img
              key={question.questionId}
              className='w-auto min-w-[30%] max-w-full h-auto max-h-[80vh] !mb-6 object-contain'
              src={question.questionImageUrl}
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
        </div>
      )}
    </div>
  );
};

export default MCQQuestion;
