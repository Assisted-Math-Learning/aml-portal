import React from 'react';
import Button from '../Button/Button';
import { ClickedButtonType } from '../questionUtils';

type QuestionButtonsComponentProps = {
  showSkipQuestionButton: boolean;
  primaryButtonText: string;
  primaryButtonTooltipMessage: string;
  disablePrimaryButton: boolean;
  disabledSecondaryButtons: boolean;
  onPrimaryButtonClicked: (clickedButton: ClickedButtonType) => void;
  onSkipQuestionClicked: () => void;
  showSkipToCurrentButton: boolean;
  onSkipToCurrentClick: () => void;
};

const QuestionButtonsComponent = ({
  primaryButtonText,
  primaryButtonTooltipMessage,
  disablePrimaryButton,
  disabledSecondaryButtons,
  onPrimaryButtonClicked,
  showSkipQuestionButton,
  onSkipQuestionClicked,
  showSkipToCurrentButton,
  onSkipToCurrentClick,
}: QuestionButtonsComponentProps) => (
  <>
    {!showSkipToCurrentButton && showSkipQuestionButton && (
      <Button
        type='button'
        tabIndex={0}
        disabled={disabledSecondaryButtons}
        className='focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md'
        onClick={onSkipQuestionClicked}
      >
        Skip
      </Button>
    )}
    {showSkipToCurrentButton && (
      <Button
        type='button'
        tabIndex={0}
        theme='outlined'
        disabled={disabledSecondaryButtons}
        className='focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md'
        onClick={onSkipToCurrentClick}
      >
        Skip to current
      </Button>
    )}
    <Button
      tabIndex={0}
      type='button'
      className='focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md'
      onClick={onPrimaryButtonClicked}
      disabled={disablePrimaryButton}
      tooltipMessage={primaryButtonTooltipMessage}
    >
      {primaryButtonText}
    </Button>
  </>
);

export default QuestionButtonsComponent;
