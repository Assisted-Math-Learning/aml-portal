import React from 'react';
import { Question, QuestionSet } from 'models/entities/QuestionSet';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { QuestionType } from 'models/enums/QuestionType.enum';
import cx from 'classnames';
import SkillTaxonomyHeader from '../SkillTaxonomyHeader/SkillTaxonomyHeader';
import QuestionsProgressBar from '../QuestionsProgressBar/QuestionsProgressBar';
import QuestionHeader from '../QuestionHeader/QuestionHeader';
import CollapsibleKeyboard from '../CollapsibleKeyboard/CollapsibleKeyboard';
import { FeedbackType } from '../questionUtils';
import QuestionFeedback from '../QuestionFeedback/QuestionFeedback';

type Props = {
  headerText: string;
  content: React.ReactNode;
  onKeyClick?: (key: string) => void;
  onBackSpaceClick?: (bool: boolean) => void;
  currentQuestion?: Question;
  taxonomy?: QuestionSet['taxonomy'];
  currentQuestionIndex?: number;
  questionsLength?: number;
  showAttemptCount?: boolean;
  renderButtons?: React.ReactNode;
  onPrevClick?: () => void;
  lastAttemptedQuestionIndex?: number;
  onSkipClicked?: () => void;
  currentQuestionFeedback?: FeedbackType | null;
  showFeedback: boolean;
};

const QuestionContainer = ({
  headerText,
  content,
  onKeyClick,
  onBackSpaceClick,
  currentQuestion,
  taxonomy,
  currentQuestionIndex = 0,
  questionsLength = 0,
  showAttemptCount,
  renderButtons,
  onPrevClick,
  lastAttemptedQuestionIndex = 0,
  onSkipClicked,
  currentQuestionFeedback,
  showFeedback,
}: Props) => (
  <div className='relative flex flex-col flex-1 w-full px-20 pb-4'>
    <div>
      <SkillTaxonomyHeader taxonomy={taxonomy} />
      {showAttemptCount && (
        <QuestionsProgressBar
          currentQuestionIndex={currentQuestionIndex}
          questionsLength={questionsLength}
        />
      )}
      <QuestionHeader HeaderText={headerText} />
    </div>
    <div className='flex flex-1 md:flex-row flex-col min-h-0'>
      <div className='md:w-[65%] w-full flex flex-col'>
        <div
          className={cx(
            'flex-1 flex-col overflow-y-auto transition-all shadow-[0_0_0_1px_black] animation-borderFadeIn mt-6 flex justify-center items-center',
            currentQuestionFeedback === FeedbackType.CORRECT &&
              'shadow-green-500 shadow-[0_0_0_4px] rounded-lg',
            currentQuestionFeedback === FeedbackType.INCORRECT &&
              'shadow-[0_0_0_4px_black] rounded-lg'
          )}
        >
          <div className='p-10 h-full [&_>_div:first-child]:py-6 grid place-items-center'>
            {content}
          </div>
        </div>
        <div className='relative w-full'>
          <div className='flex items-start justify-start min-h-[140px] text-2xl font-semibold text-headingTextColor'>
            {showAttemptCount && (
              <div className='flex items-center'>
                {currentQuestionIndex > 0 && (
                  <ChevronLeft
                    tabIndex={
                      currentQuestionIndex > 0 && showAttemptCount ? 0 : -1
                    }
                    className='cursor-pointer text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md flex items-center'
                    onClick={onPrevClick}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onPrevClick?.();
                      }
                    }}
                    sx={{ fontSize: '3rem' }}
                  />
                )}
                <span className='text-primary'>
                  {`${currentQuestionIndex + 1} / ${questionsLength}`}
                </span>
                {currentQuestionIndex < lastAttemptedQuestionIndex && (
                  <ChevronRight
                    tabIndex={
                      currentQuestionIndex < lastAttemptedQuestionIndex ? 0 : -1
                    }
                    className='cursor-pointer text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md flex items-center'
                    onClick={onSkipClicked}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onSkipClicked?.();
                      }
                    }}
                    sx={{ fontSize: '3rem' }}
                  />
                )}
              </div>
            )}
          </div>
          <div className='mt-4 absolute top-0 left-1/2 -translate-x-1/2'>
            {showAttemptCount && showFeedback && (
              <QuestionFeedback answerType={currentQuestionFeedback!} />
            )}
          </div>
        </div>
      </div>
      <div className='flex-1 gap-3 md:flex-col flex-row flex items-start md:items-end justify-start md:justify-end [&_>_span]:inline [&_>_span]:w-fit [&_>_span]:h-fit'>
        {renderButtons}
      </div>
    </div>
    {currentQuestion?.questionType !== QuestionType.MCQ && (
      <div className='fixed right-0 top-1/2 -translate-y-1/2'>
        <CollapsibleKeyboard
          onKeyClick={onKeyClick}
          onBackSpaceClick={onBackSpaceClick}
        />
      </div>
    )}
  </div>
);

export default QuestionContainer;
