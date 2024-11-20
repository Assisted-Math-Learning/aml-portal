import useEnterKeyHandler from 'hooks/useEnterKeyHandler';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ContainerLayout from 'shared-resources/components/ContainerLayout/ContainerLayout';
import { loggedInUserSelector } from 'store/selectors/auth.selector';
import { questionsSetSelector } from 'store/selectors/questionSet.selector';

const ContinueJourney: React.FC = () => {
  const navigate = useNavigate();
  const userSelector = useSelector(loggedInUserSelector);
  const questionsSet = useSelector(questionsSetSelector);
  const [questions, setQuestions] = useState<any>();
  useEffect(() => {
    if (questionsSet?.questions) {
      setQuestions(questionsSet?.questions);
    }
  }, [questionsSet]);
  const handleResumeClick = () => {
    navigate('/questions');
  };

  useEnterKeyHandler(handleResumeClick);

  return (
    <ContainerLayout
      headerText={`Welcome back ${userSelector?.username || 'Learner'}`}
      content={
        <div className='text-lg'>
          Click resume to continue from where you left.{' '}
        </div>
      }
      buttonText='RESUME'
      onButtonClick={handleResumeClick}
      buttonDisabled={!questions?.length}
      toolTipMessage='No questions available'
    />
  );
};

export default ContinueJourney;
