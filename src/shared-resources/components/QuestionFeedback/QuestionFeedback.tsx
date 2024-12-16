import React from 'react';
import { Check } from '@mui/icons-material';
import Loader from '../Loader/Loader';

type QuestionFeedbackProps = {
  answerType: 'correct' | 'incorrect' | null;
};

const incorrectAnsFeedbacks: string[][] = [['OOPS!', "Let's try one more"]];

const correctAnsFeedbacks: string[][] = [['Correct!', 'Great Job.']];

const QuestionFeedback = ({ answerType }: QuestionFeedbackProps) => {
  if (!answerType) {
    return <Loader />;
  }

  if (answerType === 'correct') {
    const randomCorrectFeedback =
      correctAnsFeedbacks[
        Math.floor(Math.random() * correctAnsFeedbacks.length)
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
    incorrectAnsFeedbacks[
      Math.floor(Math.random() * incorrectAnsFeedbacks.length)
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
