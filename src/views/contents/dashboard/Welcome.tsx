import useEnterKeyHandler from 'hooks/useEnterKeyHandler';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ContainerLayout from 'shared-resources/components/ContainerLayout/ContainerLayout';
import { loggedInUserSelector } from 'store/selectors/auth.selector';
import { questionsSetSelector } from 'store/selectors/questionSet.selector';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const userSelector = useSelector(loggedInUserSelector);
  const questionsSet = useSelector(questionsSetSelector);
  const [questions, setQuestions] = useState<any>();
  useEffect(() => {
    if (questionsSet?.questions) {
      setQuestions(questionsSet?.questions);
    }
  }, [questionsSet]);

  const handleStartClick = () => {
    navigate('/instructions'); // Redirect to instructions
  };

  useEnterKeyHandler(handleStartClick);

  return (
    <ContainerLayout
      headerText={`Hello, ${userSelector?.username || 'Learner'}`}
      content={
        <span className='text-4xl font-semibold text-headingTextColor'>
          Press Start to Begin
        </span>
      }
      buttonText='Start'
      onButtonClick={handleStartClick}
      buttonDisabled={!questions?.length}
      toolTipMessage='No questions available'
    />
  );
};

export default Welcome;
