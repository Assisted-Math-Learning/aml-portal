/* eslint-disable func-names, react/no-this-in-sfc,  no-unsafe-optional-chaining, no-lonely-if, jsx-a11y/no-autofocus, react/jsx-no-useless-fragment */
import React from 'react';
import cx from 'classnames';
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
import { DIGIT_PLACES } from 'constant/constants';
import Grid1DivisionQuestion from './Grid1DivisionQuestion';
import AmlInput from './AmlInput';

interface Grid1QuestionProps {
  errors: {
    [key: string]: boolean[] | boolean[][];
  };
  question: QuestionPropsType;
  maxLength: number;
  formik: FormikProps<FormValues>;
  setActiveField: React.Dispatch<React.SetStateAction<keyof FormValues | null>>;
  showErrors: boolean;
}

const Grid1Question = ({
  question,
  formik,
  setActiveField,
  maxLength,
  errors,
  showErrors,
}: Grid1QuestionProps) => {
  const { answers, numbers } = question;

  const shouldRenderDivisionGrid1 =
    question.operation === ArithmaticOperations.DIVISION;

  const isAnswerValid = (index: number): boolean =>
    isFieldAnswerValid('answerTop', index, answers);

  const isResultAnswerValid = (index: number): boolean =>
    isFieldAnswerValid('answerResult', index, answers);
  const isAnswerAtIndexValidFromSplit = (index: number): boolean =>
    answers.answerTop.split('|')[index] !== '' &&
    answers.answerTop.split('|')[index] !== 'B';
  const isTopAnswerDisabled = (char: string, index: number) => {
    const isValid = isAnswerValid(index);
    const isSplitValid = isAnswerAtIndexValidFromSplit(index);

    return (
      (question.operation === ArithmaticOperations.ADDITION &&
        isValid &&
        char === (answers.answerTop[index] || '')) ||
      (isSplitValid && char === answers.answerTop.split('|')[index])
    );
  };

  const isResultAnswerDisabled = (value: string, index: number) =>
    isResultAnswerValid(index) && value === (answers.answerResult[index] || '');

  const isIntermediateInputDisabled = (char: string) =>
    char !== 'B' && char !== '';

  const renderExtraSpaces = () => {
    const extraSpacesCount =
      maxLength - (formik.values?.resultAnswer?.length || 0) > 0
        ? maxLength - (formik.values?.resultAnswer?.length || 0)
        : 0;

    return Array(extraSpacesCount)
      .fill(null)
      .map((_, i) => (
        <div
          key={`extra-space-${i}`}
          className='w-[40px] h-[61px] border-transparent'
        />
      ));
  };

  const renderTopLabels = () => (
    <div className='flex justify-center self-end'>
      {DIGIT_PLACES.slice(0, String(question.answers?.result)?.length || 1)
        .reverse()
        .map((label, index) => (
          <div
            key={index}
            className='w-[46px] mr-[.35rem] p-2 text-digitTextColor text-center flex items-center justify-center font-bold text-[20px]'
          >
            {label}
          </div>
        ))}
    </div>
  );

  const renderTopAnswerInputs = () => (
    <div className='flex justify-end space-x-2 self-end'>
      {formik.values?.topAnswer?.map((char, index) => (
        <div key={`top-${index}`}>
          {char === '#' ? (
            <div className='w-[46px] h-[61px]' /> // Render blank space
          ) : (
            <AmlInput
              name={`topAnswer.${index}`}
              onFocus={() =>
                setActiveField(`topAnswer.${index}` as keyof FormValues)
              }
              value={char}
              onChange={formik.handleChange}
              maxLength={
                question.operation === ArithmaticOperations.SUBTRACTION ? 2 : 1
              } // Allow multiple digits for subtraction
              className={cx(
                showErrors &&
                  (errors.topAnswer && errors.topAnswer[index]
                    ? 'showWrongInput'
                    : 'showCorrectInput'),
                question.operation === ArithmaticOperations.SUBTRACTION
                  ? '!text-[24px]'
                  : 'text-[36px]'
              )}
              disabled={isTopAnswerDisabled(char, index)}
            />
          )}
        </div>
      ))}
      {question.operation === ArithmaticOperations.ADDITION && (
        <div className='w-12 h-10 flex items-center justify-center font-bold text-[36px]' />
      )}
    </div>
  );

  const renderNumbers = () => (
    <div className='flex flex-col space-y-2 self-end'>
      {Object.keys(numbers).map((key, idx) => (
        <div key={key} className='flex justify-end space-x-2'>
          {numbers[key].split('').map((digit, index) => (
            <div
              key={index}
              className='w-[46px] h-10 flex items-center justify-center font-bold text-[36px] relative'
            >
              {digit}
              {question.operation === ArithmaticOperations.SUBTRACTION &&
                !!answers.isPrefil &&
                idx === 0 &&
                formik.values.topAnswer?.[index] !== '#' && (
                  <div className='absolute inset-0'>
                    <div className='absolute w-full h-0 border-t-4 border-dotted border-red-700 rotate-45 top-1/2 -translate-y-1/2' />
                  </div>
                )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderMultiplicationIntermediateSteps = () => {
    if (
      question.operation !== ArithmaticOperations.MULTIPLICATION ||
      !answers?.isIntermediatePrefill ||
      !answers?.answerIntermediate
    ) {
      return null;
    }

    return (
      <div className='flex flex-col space-y-2 self-end'>
        {answers?.answerIntermediate.split('#').map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className='flex justify-end space-x-2'>
            {row.split('').map((char, index) => {
              // Calculate the flat index for the flattened structure
              const flatIndex =
                answers?.answerIntermediate
                  .split('#')
                  .slice(0, rowIndex) // Get rows before the current row
                  .reduce((acc, r) => acc + r.length, 0) + index; // Sum lengths + current index

              return (
                <AmlInput
                  key={`intermediate-${rowIndex}-${index}`}
                  name={`answerIntermediate.${flatIndex}`}
                  onFocus={() =>
                    setActiveField(
                      `answerIntermediate.${flatIndex}` as keyof FormValues
                    )
                  }
                  value={formik.values?.answerIntermediate?.[flatIndex]}
                  onChange={formik.handleChange}
                  disabled={isIntermediateInputDisabled(char)}
                  className={cx(
                    showErrors &&
                      (errors.answerIntermediate &&
                      errors.answerIntermediate[rowIndex] &&
                      (errors.answerIntermediate[rowIndex] as boolean[])[index]
                        ? 'showWrongInput'
                        : 'showCorrectInput')
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderResultInputs = () => (
    <div className='flex space-x-2'>
      {renderExtraSpaces()}
      <div className='w-12 h-10 flex items-center justify-center font-bold text-[36px]' />
      {formik.values?.resultAnswer?.map((value, index) => (
        <div key={`result-${index}`}>
          <AmlInput
            name={`resultAnswer.${index}`}
            onFocus={() =>
              setActiveField(`resultAnswer.${index}` as keyof FormValues)
            }
            autoFocus
            value={formik.values?.resultAnswer?.[index]}
            onChange={formik.handleChange}
            disabled={isResultAnswerDisabled(value, index)}
            className={cx(
              showErrors &&
                (errors.resultAnswer && errors.resultAnswer[index]
                  ? 'showWrongInput'
                  : 'showCorrectInput')
            )}
          />
        </div>
      ))}
    </div>
  );

  return (
    <>
      {shouldRenderDivisionGrid1 && (
        <Grid1DivisionQuestion
          errors={errors}
          showErrors={showErrors}
          formik={formik}
          question={question}
          setActiveField={setActiveField}
        />
      )}

      {!shouldRenderDivisionGrid1 && (
        <>
          {/* Top labels */}
          {renderTopLabels()}

          {/* Top answer inputs */}
          {answers?.isPrefil && renderTopAnswerInputs()}

          {/* Numbers */}
          {renderNumbers()}

          {/* Separator */}
          <div className='w-full relative'>
            <span className='absolute bottom-4 left-4'>
              {operationMap[question.operation]}
            </span>
            <hr className='w-full text-black border border-black' />
          </div>

          {/* Intermediate Inputs (Only for Multiplication) */}

          {question.operation === ArithmaticOperations.MULTIPLICATION &&
            renderMultiplicationIntermediateSteps()}

          {/* Separator */}
          {answers?.isIntermediatePrefill && (
            <div className='w-full relative'>
              <span className='absolute bottom-4 left-4'>
                {operationMap[ArithmaticOperations.ADDITION]}
              </span>
              <hr className='w-full text-black border border-black' />
            </div>
          )}

          {/* Result answer inputs */}
          {renderResultInputs()}
        </>
      )}
    </>
  );
};
export default Grid1Question;
