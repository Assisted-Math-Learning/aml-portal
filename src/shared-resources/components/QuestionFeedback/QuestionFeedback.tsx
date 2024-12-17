import React from 'react';
import { Check } from '@mui/icons-material';
import {
  CORRECT_ANSWER_FEEDBACK_PLACEHOLDERS,
  INCORRECT_ANSWER_FEEDBACK_PLACEHOLDERS,
} from 'constant/constants';
import Loader from '../Loader/Loader';
import { FeedbackType } from '../questionUtils';

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
      <div className='text-center'>
        <Check className='text-green-500 !text-[6rem] font-light' />
        <p className='text-green-500 text-2xl font-bold'>
          {randomCorrectFeedback[0]}
        </p>
        <p className='text-green-500 text-2xl font-bold'>
          {randomCorrectFeedback[1]}
        </p>
      </div>
    );
  }

  const randomIncorrectFeedback =
    INCORRECT_ANSWER_FEEDBACK_PLACEHOLDERS[
      Math.floor(Math.random() * INCORRECT_ANSWER_FEEDBACK_PLACEHOLDERS.length)
    ];

  return (
    <div className='text-center'>
      <p className='text-black text-2xl font-bold'>
        {randomIncorrectFeedback[0]}
      </p>
      <p className='text-black text-2xl font-bold'>
        {randomIncorrectFeedback[1]}
      </p>
    </div>
  );
};

export default QuestionFeedback;
