import React from 'react';
import { multiLangLabels } from 'utils/constants/multiLangLabels.constants';
import { useLanguage } from 'context/LanguageContext';
import { getTranslatedString } from '../MultiLangText/MultiLangText';

type QuestionsProgressBarProps = {
  currentQuestionIndex: number;
  questionsLength: number;
};

const QuestionsProgressBar: React.FC<QuestionsProgressBarProps> = ({
  currentQuestionIndex,
  questionsLength,
}) => {
  const { language } = useLanguage();
  const barWidth =
    questionsLength > 0
      ? ((currentQuestionIndex + 1) / questionsLength) * 100
      : 0;

  return (
    <div className='mt-3 -mb-7'>
      <div className='w-full h-2 bg-slate-300 rounded-[9999px] relative'>
        <div
          className='absolute top-0 left-0 h-2 rounded-[9999px] bg-primary'
          style={{
            width: `${barWidth}%`,
          }}
        />
      </div>
      <div className='leading-8 text-right font-semibold text-headingTextColor'>
        {`${getTranslatedString(language, multiLangLabels.questions_left)} ${
          questionsLength - currentQuestionIndex - 1
        }`}
      </div>
    </div>
  );
};

export default QuestionsProgressBar;
