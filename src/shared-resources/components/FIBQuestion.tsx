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
import { FibType } from 'models/enums/QuestionType.enum';
import cx from 'classnames';
import { useImageLoader } from 'hooks/useImageLoader';
import AmlInput from './AmlInput';
import { ImageRenderer } from './ImageRenderer';

interface FIBQuestionProps {
  question: QuestionPropsType;
  formik: FormikProps<FormValues>;
  setActiveField: React.Dispatch<React.SetStateAction<keyof FormValues | null>>;
  disabled?: boolean;
}

const FIBQuestion = ({
  question,
  formik,
  setActiveField,
  disabled,
}: FIBQuestionProps) => {
  const { answers } = question;
  const {
    isImageLoading,
    isImageReady,
    imgError,
    handleImageLoad,
    setImgError,
  } = useImageLoader(question?.questionImageUrl);

  const shouldRenderQuotientRemainderDivisionFib =
    question.operation === ArithmaticOperations.DIVISION &&
    (answers.fib_type === FibType.FIB_QUOTIENT_REMAINDER ||
      answers.fib_type === FibType.FIB_QUOTIENT_REMAINDER_WITH_IMAGE);

  const shouldRenderFibWithImage =
    answers.fib_type === FibType.FIB_STANDARD_WITH_IMAGE ||
    answers.fib_type === FibType.FIB_QUOTIENT_REMAINDER_WITH_IMAGE;

  const handleSetField = (fieldName: keyof FormValues) => () => {
    setActiveField(fieldName);
  };

  const renderFibContent = () => {
    if (!shouldRenderFibWithImage) {
      return (
        <p className='text-4xl font-semibold text-headingTextColor pt-[23px] pb-[22px] px-[7px]'>
          {Object.values(question?.numbers || {}).join(
            operationMap[question.operation]
          )}{' '}
          =
        </p>
      );
    }
    return (
      <ImageRenderer
        imageUrl={question.questionImageUrl || ''}
        isImageLoading={isImageLoading}
        isImageReady={isImageReady}
        imgError={imgError}
        onImageLoad={handleImageLoad}
        onImageError={() => setImgError(true)}
      />
    );
  };

  return (
    <div>
      {shouldRenderQuotientRemainderDivisionFib && (
        <div
          className={cx(`flex flex-col items-center justify-center relative`)}
        >
          {renderFibContent()}
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
                disabled={disabled}
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
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      )}
      {!shouldRenderQuotientRemainderDivisionFib && (
        <div
          className={cx(
            `flex items-center justify-center relative`,
            shouldRenderFibWithImage ? 'flex-col' : 'flex-row'
          )}
        >
          {renderFibContent()}
          <div className='flex flex-col space-y-2 w-[236px]'>
            <AmlInput
              name='fibAnswer'
              onFocus={handleSetField('fibAnswer')}
              autoFocus
              value={formik.values.fibAnswer}
              onChange={formik.handleChange}
              maxLength={9}
              className='!w-full'
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FIBQuestion;
