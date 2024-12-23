/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import React from 'react';
import Button from 'shared-resources/components/Button/Button';
import QuestionHeader from '../QuestionHeader/QuestionHeader';

interface ContainerLayoutProps {
  headerText: string;
  content: React.ReactNode;
  buttonText: string;
  onButtonClick: () => void;
  buttonDisabled?: boolean;
  toolTipMessage?: string;
}

const ContainerLayout: React.FC<ContainerLayoutProps> = ({
  headerText,
  content,
  buttonText,
  onButtonClick,
  buttonDisabled,
  toolTipMessage,
}) => (
  <div className='flex flex-1 flex-col h-full pl-20 pr-20'>
    <QuestionHeader HeaderText={headerText} />
    <div className='flex flex-col md:flex-row gap-6 items-center md:items-end md:h-[80%] justify-start md:justify-between px-6 py-10 pl-0 max-h-full'>
      <div className='relative w-full h-[65%] md:h-full md:w-[65%] border border-black mt-6 flex flex-col items-center justify-center'>
        <div className='overflow-y-auto p-8 gap-6 md:gap-14 w-full flex flex-col items-center'>
          {content}
        </div>
      </div>
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

export default ContainerLayout;
