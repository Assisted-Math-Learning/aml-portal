import React from 'react';
import {
  CORRECT_ANSWER_FEEDBACK_PLACEHOLDERS,
  INCORRECT_ANSWER_FEEDBACK_PLACEHOLDERS,
} from 'constant/constants';
import Loader from '../Loader/Loader';
import { FeedbackType } from '../questionUtils';
import AnimatedTick from '../AnimatedTick/AnimatedTick';
import AnimatedTryAgain from '../AnimatedTick/AnimatedTryAgain';

type QuestionFeedbackProps = {
  answerType: FeedbackType | null;
};

const QuestionFeedback = ({ answerType }: QuestionFeedbackProps) => {
  if (!answerType) {
    return <Loader />;
  }

  if (answerType === FeedbackType.CORRECT) {
    const randomCorrectFeedback =
      CORRECT_ANSWER_FEEDBACK_PLACEHOLDERS[
        Math.floor(Math.random() * CORRECT_ANSWER_FEEDBACK_PLACEHOLDERS.length)
      ];
    return (
      <div className='flex flex-col items-center text-center'>
        <AnimatedTick />
        <div>
          <p className='text-green-500 text-xl font-bold'>
            {randomCorrectFeedback[0]}
          </p>
        </div>
      </div>
    );
  }

  const randomIncorrectFeedback =
    INCORRECT_ANSWER_FEEDBACK_PLACEHOLDERS[
      Math.floor(Math.random() * INCORRECT_ANSWER_FEEDBACK_PLACEHOLDERS.length)
    ];

  return (
    <div className='flex flex-col items-center text-center'>
      <AnimatedTryAgain />
      <div>
        <p className='text-black text-xl font-bold'>
          {randomIncorrectFeedback[0]}
        </p>
      </div>
    </div>
  );
};

export default QuestionFeedback;
