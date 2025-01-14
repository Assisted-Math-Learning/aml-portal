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
import { TelemetryDataEventType } from '../../../models/enums/telemetryDataEventType.enum';

type Props = {
  onAssess?: (eventType: TelemetryDataEventType, data?: any) => void;
};

const Welcome: React.FC<Props> = ({ onAssess }) => {
  const navigate = useNavigate();
  const userSelector = useSelector(loggedInUserSelector);
  const questionsSet = useSelector(questionsSetSelector);

  const { language } = useLanguage();

  const [questions, setQuestions] = useState<any>();
  useEffect(() => {
    if (questionsSet?.questions) {
      setQuestions(questionsSet?.questions);
    }
  }, [questionsSet]);

  const handleStartClick = () => {
    onAssess?.(TelemetryDataEventType.START_BUTTON_CLICKED, {
      currentQuestionSet: questionsSet?.identifier,
    });
    navigate('/instructions'); // Redirect to instructions
  };

  useEnterKeyHandler(handleStartClick);

  return (
    <ContainerLayout
      headerText={`${getTranslatedString(language, multiLangLabels.hello)}, ${
        userSelector?.username ||
        getTranslatedString(language, multiLangLabels.learner)
      }`}
      content={
        <MultiLangText
          component='span'
          className='text-4xl font-semibold text-headingTextColor'
          labelMap={multiLangLabels.press_start_to_begin}
        />
      }
      buttonText={getTranslatedString(language, multiLangLabels.start)}
      onButtonClick={handleStartClick}
      buttonDisabled={!questions?.length}
      toolTipMessage={getTranslatedString(
        language,
        multiLangLabels.no_questions_available
      )}
    />
  );
};

export default Welcome;
