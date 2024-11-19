/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import React from 'react';
import Button from 'shared-resources/components/Button/Button';
import { webRoutes } from 'utils/constants/webRoutes.constants';
import { QuestionType } from 'models/enums/QuestionType.enum';
import { Question } from 'models/entities/QuestionSet';
import { useLocation } from 'react-router-dom';
import CollapsibleKeyboard from '../CollapsibleKeyboard/CollapsibleKeyboard';
import QuestionHeader from '../QuestionHeader/QuestionHeader';

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
}) => {
  const location = useLocation();
  return (
    <div className='flex flex-col h-full pl-20 pr-20'>
      <QuestionHeader HeaderText={headerText} />
      <div className='flex flex-col md:flex-row gap-6 items-center md:items-end justify-between p-6 pl-0 overflow-y-auto md:h-[80%] max-h-full'>
        <div className='w-full h-full md:w-[65%] p-8 border border-black mt-6 flex flex-col gap-6 md:gap-14 items-center justify-center'>
          {content}
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
