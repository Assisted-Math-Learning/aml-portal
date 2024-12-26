import { ArithmaticOperations } from 'models/enums/ArithmaticOperations.enum';
import { FibType, QuestionType } from 'models/enums/QuestionType.enum';

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
}

export const isFieldAnswerValid = (
  field: 'answerTop' | 'answerResult' | 'answerQuotient',
  index: number,
  answers: any
): boolean =>
  (answers[field][index] || '') !== '' && (answers[field][index] || '') !== 'B';
