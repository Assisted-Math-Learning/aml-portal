import { ArithmaticOperations } from 'models/enums/ArithmaticOperations.enum';
import { FibType, QuestionType } from 'models/enums/QuestionType.enum';
import { SupportedLanguages } from 'types/enum';
import { multiLangLabels } from 'utils/constants/multiLangLabels.constants';
import * as _ from 'lodash';
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
  CHECK_AND_SUBMIT = 'check_and_submit',
  CHECK = 'check',
  SKIP = 'skip',
}

export const getButtonText = (
  language: keyof typeof SupportedLanguages,
  isSyncing: boolean,
  isCompleted: boolean
) => {
  if (isSyncing) return getTranslatedString(language, multiLangLabels.syncing);

  if (isCompleted)
    return getTranslatedString(language, multiLangLabels.next_set);

  return 'Submit';
};

export const getButtonTooltipMessage = (
  language: keyof typeof SupportedLanguages,
  isSyncing: boolean,
  currentQuestionType: QuestionType,
  currentQuestionFeedback: FeedbackType | null
) => {
  if (isSyncing)
    return getTranslatedString(language, multiLangLabels.sync_in_progress);

  if (currentQuestionFeedback !== null) return '';

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

export const getFilteredAnswer = (
  gridData: any,
  lastAttemptedQuestionIndex: number,
  questionsLength: number
) => {
  const currentTime = new Date().toISOString();
  const newAnswer = {
    ...gridData,
    start_time: lastAttemptedQuestionIndex === 0 ? currentTime : '',
    end_time:
      lastAttemptedQuestionIndex === questionsLength - 1 ? currentTime : '',
  };
  const filteredAnswer = {
    questionId: newAnswer.questionId,
    start_time: newAnswer.start_time,
    end_time: newAnswer.end_time,
    answers: _.omitBy(
      {
        topAnswer: newAnswer.topAnswer,
        answerIntermediate: newAnswer?.answerIntermediate,
        answerQuotient: newAnswer?.answerQuotient,
        answerRemainder: newAnswer?.answerRemainder,
        resultAnswer: newAnswer.resultAnswer,
        row1Answers: newAnswer.row1Answers,
        row2Answers: newAnswer.row2Answers,
        fibAnswer: newAnswer.fibAnswer,
        mcqAnswer: newAnswer.mcqAnswer,
      },
      _.isUndefined
    ),
    operation: newAnswer?.operation,
  };
  return filteredAnswer;
};
