/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import React from 'react';
import Button from 'shared-resources/components/Button/Button';
import { webRoutes } from 'utils/constants/webRoutes.constants';
import { QuestionType } from 'models/enums/QuestionType.enum';
import { Question, QuestionSet } from 'models/entities/QuestionSet';
import { useLocation } from 'react-router-dom';
import CollapsibleKeyboard from '../CollapsibleKeyboard/CollapsibleKeyboard';
import QuestionHeader from '../QuestionHeader/QuestionHeader';
import SkillTaxonomyHeader from '../SkillTaxonomyHeader/SkillTaxonomyHeader';
import QuestionsProgressBar from '../QuestionsProgressBar/QuestionsProgressBar';

interface ContainerLayoutProps {
  headerText: string;
  content: React.ReactNode;
  buttonText: string;
  onButtonClick: () => void;
  buttonDisabled?: boolean;
  toolTipMessage?: string;
  onKeyClick?: (key: string) => void;
  onBackSpaceClick?: (bool: boolean) => void;
  currentQuestion?: Question;
  noKeyboard?: boolean;
  taxonomy?: QuestionSet['taxonomy'];
  currentQuestionIndex?: number;
  questionsLength?: number;
  showAttemptCount?: boolean;
}

const ContainerLayout: React.FC<ContainerLayoutProps> = ({
  headerText,
  content,
  buttonText,
  onButtonClick,
  buttonDisabled,
  toolTipMessage,
  onKeyClick,
  onBackSpaceClick,
  currentQuestion,
  noKeyboard,
  taxonomy,
  currentQuestionIndex = 0,
  questionsLength = 0,
  showAttemptCount,
}) => {
  const location = useLocation();

  return (
    <div className='flex flex-col h-full pl-20 pr-20'>
      <SkillTaxonomyHeader taxonomy={taxonomy} />
      {showAttemptCount && (
        <QuestionsProgressBar
          currentQuestionIndex={currentQuestionIndex}
          questionsLength={questionsLength}
        />
      )}
      <QuestionHeader HeaderText={headerText} />
      <div className='flex flex-col md:flex-row gap-6 items-center md:items-end md:h-[80%] justify-start md:justify-between px-6 py-10 pl-0 max-h-full'>
        <div className='relative w-full h-[65%] md:h-full md:w-[65%] border border-black mt-6 flex flex-col items-center justify-center'>
          <div className='overflow-y-auto p-8 gap-6 md:gap-14 w-full flex flex-col items-center'>
            {content}
          </div>
          <span className='absolute left-[46%] bottom-[-34px] text-2xl font-semibold text-headingTextColor'>
            {showAttemptCount
              ? `${currentQuestionIndex + 1} / ${questionsLength}`
              : ''}
          </span>
        </div>
        {location.pathname === webRoutes.questions.root() &&
          currentQuestion?.questionType !== QuestionType.MCQ &&
          !noKeyboard && (
            <div className='fixed right-0 top-[20%]'>
              <CollapsibleKeyboard
                onKeyClick={onKeyClick}
                onBackSpaceClick={onBackSpaceClick}
              />
            </div>
          )}
        <div
          tabIndex={0}
          className='w-full md:w-auto mt-8 mb-10 md:mt-0 flex justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md'
        >
          <Button
            type='button'
            onClick={onButtonClick}
            disabled={buttonDisabled}
            tooltipMessage={toolTipMessage}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContainerLayout;
