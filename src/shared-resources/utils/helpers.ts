/* eslint-disable @typescript-eslint/naming-convention */
import { ArithmaticOperations } from 'models/enums/ArithmaticOperations.enum';
import { QuestionType } from 'models/enums/QuestionType.enum';

type LearnerResponse = {
  result: string;
  answer_top?: string;
};

type QuestionData = {
  question_id: string;
  question_set_id: string;
  learner_response: LearnerResponse;
};

export function getUserInitials(name: string): string {
  // Trim and split the string into an array of words
  const words = name.trim()?.split(/\s+/);

  // Get the first letter of the first word and the first letter of the last word
  const firstInitial = words[0][0].toUpperCase();
  const lastInitial =
    words.length > 1 ? words[words.length - 1][0].toUpperCase() : '';

  // Return the initials
  return firstInitial + lastInitial;
}

export const transformQuestions = (apiQuestions: any): any =>
  apiQuestions.map((apiQuestion: any) => {
    const {
      question_body,
      identifier,
      question_type,
      description,
      name,
      operation,
    } = apiQuestion;

    // Construct answers only if present
    const answers = question_body?.answers
      ? {
          ...(question_body.answers.result !== undefined && {
            result: question_body.answers.result,
          }),
          ...(question_body.answers.isPrefil !== undefined && {
            isPrefil: question_body.answers.isPrefil,
          }),
          ...(question_body.answers.answerTop !== undefined && {
            answerTop: question_body.answers.answerTop,
          }),
          ...(question_body.answers.answerResult !== undefined && {
            answerResult: question_body.answers.answerResult,
          }),
        }
      : undefined;

    // Construct numbers only if present
    const numbers = question_body?.numbers
      ? {
          ...question_body.numbers, // Spread to keep the dynamic structure (n1, n2, etc.)
        }
      : undefined;

    // Construct options only for MCQ type questions
    const options =
      question_type === QuestionType.MCQ ? question_body?.options : undefined;
    const questionImage = question_body?.question_image
      ? { ...question_body.question_image }
      : undefined;
    return {
      questionId: identifier, // Assigning identifier as questionId
      questionType: question_type, // Adding questionType from the API
      description, // Adding description from the API
      name,
      operation,
      ...(answers && { answers }), // Include only if answers exist
      ...(numbers && { numbers }), // Include only if numbers exist
      ...(options && { options }), // Include only if it's an MCQ question
      ...(questionImage && { questionImage }),
    };
  });

export function convertSingleResponseToLearnerResponse(
  item: any,
  questionSetId: string
): QuestionData {
  const { questionId, start_time, end_time, answers, operation } = item;

  let result = '';
  let answer_top = '';

  if (answers?.resultAnswer) {
    result = answers.resultAnswer.join('');
  } else if (answers?.fibAnswer) {
    result = answers.fibAnswer;
  } else if (answers?.mcqAnswer) {
    result = answers.mcqAnswer;
  } else if (answers?.row2Answers) {
    result = answers.row2Answers.join('');
  }

  if (answers?.topAnswer) {
    answer_top =
      operation === ArithmaticOperations.SUBTRACTION
        ? answers.topAnswer.join('|')
        : answers.topAnswer.join('');
  } else if (answers?.row1Answers) {
    answer_top = answers.row1Answers.join('');
  }
  // Build the learner response
  const learner_response: LearnerResponse = { result };
  if (answer_top) {
    learner_response.answer_top = answer_top;
  }

  // Return the transformed question data
  return {
    question_id: questionId,
    ...(start_time && { start_time }), // Include start_time only if it has a value
    ...(end_time && { end_time }), // Include end_time only if it has a value
    question_set_id: questionSetId,
    learner_response,
  };
}

export function convertResponseToLearnerResponse(
  response: any[],
  questionSetId: string
): QuestionData[] {
  return response.map((item) =>
    convertSingleResponseToLearnerResponse(item, questionSetId)
  );
}

export function convertToCamelCase(input: {
  src: string;
  file_name: string;
  mediaType: string;
  mime_type: string;
}): {
  fileName: string;
  src: string;
  mimeType: string;
  mediaType: string;
} {
  return {
    fileName: input.file_name,
    src: `${input.src}`,
    mimeType: input.mime_type,
    mediaType: input.mediaType,
  };
}
