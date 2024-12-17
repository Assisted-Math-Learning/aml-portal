import { ArithmaticOperations } from 'models/enums/ArithmaticOperations.enum';
import { FibType, QuestionType } from 'models/enums/QuestionType.enum';
import { SupportedLanguages } from 'types/enum';
import { multiLangLabels } from 'utils/constants/multiLangLabels.constants';
import { getTranslatedString } from './MultiLangText/MultiLangText';

export interface FormValues {
  topAnswer: string[];
  answerQuotient: string | string[];
  answerRemainder: string | string[];
  resultAnswer: string[];
  row1Answers: string[];
  row2Answers: string[];
  questionType: QuestionType;
  fibAnswer: string;
  mcqAnswer: string;
  questionId: string;
  answerIntermediate: any;
}

export interface QuestionPropsType {
  answers: {
    result:
      | {
          quotient: string;
          remainder: string;
        }
      | string;
    isPrefil: boolean;
    answerTop: string;
    answerResult: string;
    answerIntermediate: string;
    answerQuotient: string;
    answerRemainder: string;
    isIntermediatePrefill?: boolean;
    fib_type?: FibType;
  };
  numbers: {
    [key: string]: string;
  };
  questionType: QuestionType;
  questionId: string;
  options?: string[];
  name?: { en: string };
  operation: ArithmaticOperations;
  questionImageUrl?: string;
  correct_option?: string;
}

export const isFieldAnswerValid = (
  field: 'answerTop' | 'answerResult' | 'answerQuotient',
  index: number,
  answers: any
): boolean =>
  (answers[field][index] || '') !== '' && (answers[field][index] || '') !== 'B';

export enum FeedbackType {
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
}

export enum ClickedButtonType {
  NEXT = 'next',
  CHECK = 'check',
  SKIP = 'skip',
  TRY_AGAIN = 'try-again',
}

export const getButtonText = (
  language: keyof typeof SupportedLanguages,
  isSyncing: boolean,
  isCompleted: boolean,
  currentQuestionFeedback: string | null,
  currentQuestionType: QuestionType
) => {
  if (isSyncing) return getTranslatedString(language, multiLangLabels.syncing);

  if (isCompleted)
    return getTranslatedString(language, multiLangLabels.next_set);

  if (currentQuestionFeedback === FeedbackType.INCORRECT) return 'Try Again';

  if (currentQuestionType === QuestionType.MCQ)
    return getTranslatedString(language, multiLangLabels.next);

  return 'Check';
};

export const getButtonTooltipMessage = (
  language: keyof typeof SupportedLanguages,
  isSyncing: boolean,
  currentQuestionType: QuestionType
) => {
  if (isSyncing)
    return getTranslatedString(language, multiLangLabels.sync_in_progress);

  if (currentQuestionType === QuestionType.MCQ)
    return getTranslatedString(
      language,
      multiLangLabels.select_one_option_to_continue
    );

  return getTranslatedString(
    language,
    multiLangLabels.fill_in_all_the_empty_blanks_to_continue
  );
};
