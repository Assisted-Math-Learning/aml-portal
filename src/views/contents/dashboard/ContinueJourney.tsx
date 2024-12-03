import { useLanguage } from 'context/LanguageContext';
import useEnterKeyHandler from 'hooks/useEnterKeyHandler';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ContainerLayout from 'shared-resources/components/ContainerLayout/ContainerLayout';
import MultiLangText, {
  getTranslatedString,
} from 'shared-resources/components/MultiLangText/MultiLangText';
import { loggedInUserSelector } from 'store/selectors/auth.selector';
import { questionsSetSelector } from 'store/selectors/questionSet.selector';
import { multiLangLabels } from 'utils/constants/multiLangLabels.constants';

const ContinueJourney: React.FC = () => {
  const navigate = useNavigate();
  const userSelector = useSelector(loggedInUserSelector);
  const questionsSet = useSelector(questionsSetSelector);
  const [questions, setQuestions] = useState<any>();

  const { language } = useLanguage();

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
      headerText={`${getTranslatedString(
        language,
        multiLangLabels.welcome_back
      )} ${userSelector?.username || 'Learner'}`}
      content={
        <MultiLangText
          component='div'
          className='text-lg'
          labelMap={
            multiLangLabels.click_resume_to_continue_from_where_you_left
          }
        />
      }
      buttonText={getTranslatedString(language, multiLangLabels.resume)}
      onButtonClick={handleResumeClick}
      buttonDisabled={!questions?.length}
      toolTipMessage='No questions available'
    />
  );
};

export default ContinueJourney;
