/* eslint-disable no-continue */
import { FibType, QuestionType } from 'models/enums/QuestionType.enum';
import { QuestionPropsType } from 'shared-resources/components/questionUtils';
import { ArithmaticOperations } from 'models/enums/ArithmaticOperations.enum';
import { LearnerResponse, replaceAt } from './helpers';

// TODO: Only leave intermediate steps calculation in Grid 1 questions
// check final result with BE result data

type ValidationResult = {
  result: boolean;
  correctAnswer?: {
    topAnswer?: {
      result: boolean;
      correctAnswer?: string;
    };
    resultAnswer?: {
      result: boolean;
      correctAnswer?: string;
    };
    answerIntermediate?: {
      result: boolean;
      correctAnswer?: string;
    };
    answerQuotient?: {
      result: boolean;
      correctAnswer?: string;
    };
    answerRemainder?: {
      result: boolean;
      correctAnswer?: string;
    };
    row1Answers?: {
      result: boolean;
      correctAnswer?: string;
    };
    row2Answers?: {
      result: boolean;
      correctAnswer?: string;
    };
  };
};

const addPaddingToDifference = (n1: number, n2: number) =>
  !(
    n1.toString().length === 2 &&
    n2.toString().length === 1 &&
    (n1 - n2).toString().length === 1
  );

const addGrid1Answer = (
  question: QuestionPropsType,
  answer: LearnerResponse
): ValidationResult => {
  const {
    numbers,
    answers: { isPrefil, answerTop },
  } = question;

  const [fibNumber1, fibNumber2] = Object.values(numbers);

  const maxLength = Math.max(fibNumber1.length, fibNumber2.length);
  const n1Str = fibNumber1.padStart(maxLength, '0');
  const n2Str = fibNumber2.padStart(n1Str.length, '0');
  const maxLengthTwoNumber = Math.max(fibNumber1.length, fibNumber2.length);

  const result = parseInt(n1Str, 10) + parseInt(n2Str, 10);

  const resultStr = result.toString();

  let carryString = '';
  if (isPrefil) {
    let carry = 0;
    for (let i = maxLengthTwoNumber - 1; i >= 0; i -= 1) {
      const sum = parseInt(n1Str[i], 10) + parseInt(n2Str[i], 10) + carry;
      carry = Math.floor(sum / 10);
      carryString = carry.toString() + carryString;
    }
    carryString = carryString.slice(carryString.length - answerTop.length);

    if (carryString !== answer.answerTop?.replace(/#/g, '0'))
      return {
        result: false,
        correctAnswer: {
          topAnswer: {
            result: false,
            correctAnswer: carryString,
          },
          resultAnswer: {
            result: resultStr === answer.result,
            correctAnswer: resultStr,
          },
        },
      };
  }

  return {
    result: resultStr === answer.result,
    correctAnswer: {
      resultAnswer: {
        result: resultStr === answer.result,
        correctAnswer: resultStr,
      },
    },
  };
};

const borrowAndReturnNewNumber = (
  num: string,
  currentIndex: number
): string => {
  let numStr = num;
  const numOnLeft = +numStr[currentIndex - 1];
  if (numOnLeft > 0) {
    numStr = replaceAt(numStr, currentIndex - 1, `${numOnLeft - 1}`);
    return numStr;
  }

  return borrowAndReturnNewNumber(
    replaceAt(numStr, currentIndex - 1, '9'),
    currentIndex - 1
  );
};

const getSubGrid1AnswerTop = (n1: number, n2: number): string[] => {
  const originalN1Str = n1.toString();
  let n1Str = n1.toString();

  const L = n1Str.length;

  const n2Str = n2.toString().padStart(L, '0');

  const result = Array(L).fill('0');

  for (let i = L - 1; i >= 0; i -= 1) {
    const num1 = +n1Str[i];
    const num2 = +n2Str[i];
    if (num1 < num2) {
      result[i] = num1 + 10;
      n1Str = borrowAndReturnNewNumber(n1Str, i);
      result[i] = `${num1 + 10}`;
      result[i - 1] = n1Str[i - 1];
    } else if (originalN1Str[i] !== n1Str[i]) {
      result[i] = n1Str[i];
    }
  }
  return result;
};

const subGrid1Answer = (
  question: QuestionPropsType,
  answer: LearnerResponse
): ValidationResult => {
  const {
    numbers,
    answers: { isPrefil },
  } = question;

  const [fibNumber1, fibNumber2] = Object.values(numbers);

  const maxLength = Math.max(fibNumber1.length, fibNumber2.length);
  const n1Str = fibNumber1.padStart(maxLength, '0');
  const n2Str = fibNumber2.padStart(n1Str.length, '0');
  let result = 0;

  const n1 = parseInt(n1Str, 10);
  const n2 = parseInt(n2Str, 10);

  result = n1 - n2;

  const answerTop: string = getSubGrid1AnswerTop(n1, n2).join('|');

  const addPaddingToResult = addPaddingToDifference(n1, n2);
  const resultStr = addPaddingToResult
    ? result.toString().padStart(n1Str.length, '0')
    : result.toString();

  if (isPrefil && answerTop !== answer.answerTop)
    return {
      result: false,
      correctAnswer: {
        topAnswer: {
          result: false,
          correctAnswer: answerTop,
        },
        resultAnswer: {
          result: resultStr === answer.result,
          correctAnswer: resultStr,
        },
      },
    };

  return {
    result: resultStr === answer.result,
    correctAnswer: {
      resultAnswer: {
        result: resultStr === answer.result,
        correctAnswer: resultStr,
      },
    },
  };
};

const addFIBAnswer = (
  question: QuestionPropsType,
  answer: LearnerResponse
): ValidationResult => {
  const {
    answers: { result },
  } = question;

  return { result: answer.result?.toString() === result.toString() };
};

const subFIBAnswer = (
  question: QuestionPropsType,
  answer: LearnerResponse
): ValidationResult => {
  const {
    answers: { result },
  } = question;

  return { result: answer.result === result.toString() };
};

const multiplicationGrid1Answer = (
  question: QuestionPropsType,
  answer: LearnerResponse
): ValidationResult => {
  const {
    numbers,
    answers: { isIntermediatePrefill },
  } = question;

  const [n1, n2] = Object.values(numbers).map(Number);

  const answers: string[] = [];
  const actualResult = n1 * n2;

  const actualResultStr = actualResult.toString();

  if (isIntermediatePrefill) {
    let factor = 1;
    let num2Copy = n2;

    while (num2Copy > 0) {
      const lastDigit = num2Copy % 10;
      const product = lastDigit * n1 * factor;
      const result =
        product === 0
          ? product
              .toString()
              .padStart(n1.toString().length + Math.log10(factor), '0')
          : product.toString();
      answers.unshift(result);
      factor *= 10;
      num2Copy = Math.floor(num2Copy / 10);
    }

    if (answers.reverse().join('#') !== answer.answerIntermediate)
      return {
        result: false,
        correctAnswer: {
          answerIntermediate: {
            result: false,
            correctAnswer: answers.reverse().join('#'),
          },
          resultAnswer: {
            result: actualResultStr === answer.result,
            correctAnswer: actualResultStr,
          },
        },
      };
  }

  return {
    result: actualResultStr === answer.result,
    correctAnswer: {
      resultAnswer: {
        result: actualResultStr === answer.result,
        correctAnswer: actualResultStr,
      },
    },
  };
};

const multiplicationFIBAnswer = (
  question: QuestionPropsType,
  answer: LearnerResponse
): ValidationResult => {
  const {
    answers: { result },
  } = question;

  return { result: answer.result === result.toString() };
};

const grid2Answer = (
  question: QuestionPropsType,
  answer: LearnerResponse
): ValidationResult => {
  const { numbers, operation } = question;

  const [n1, n2] = Object.values(numbers);

  let isR1Correct = false;
  let isR2Correct = false;

  if (n1 === n2 && n1 === answer.answerTop && n1 === answer.result)
    return { result: true };

  if (operation === ArithmaticOperations.SUBTRACTION) {
    if (n1 === answer.answerTop && n2 === answer.result)
      return { result: true };

    return {
      result: false,
      correctAnswer: {
        row1Answers: {
          result: n1 === answer.answerTop,
          correctAnswer: n1,
        },
        row2Answers: {
          result: n2 === answer.result,
          correctAnswer: n2,
        },
      },
    };
  }

  const correctNumberInR1Index = [n1, n2].indexOf(answer.answerTop ?? '');
  const correctNumberInR2Index = [n1, n2].indexOf(answer.result ?? '');

  if (correctNumberInR1Index > -1) isR1Correct = true;
  if (answer.answerTop !== answer.result && correctNumberInR2Index > -1)
    isR2Correct = true;

  if (isR1Correct && isR2Correct) return { result: true };

  return {
    result: false,
    correctAnswer: {
      row1Answers: {
        result: isR1Correct,
        correctAnswer:
          !isR1Correct && isR2Correct
            ? [n1, n2][1 - correctNumberInR2Index]
            : n1,
      },
      row2Answers: {
        result: isR2Correct,
        correctAnswer:
          !isR2Correct && isR1Correct
            ? [n1, n2][1 - correctNumberInR1Index]
            : n2,
      },
    },
  };
};

const mcqAnswer = (
  question: QuestionPropsType,
  answer: LearnerResponse
): ValidationResult => ({ result: question.correct_option === answer.result });

const getDivGrid1IntermediateStepsQuotientAndRemainder = (
  dividend: number,
  divisor: number
) => {
  const dividendString = dividend.toString();
  const answers: string[] = [];

  const answersWithPadding: string[] = [];

  let currentNumber = 0;
  let currentDigitIndex = 0;
  let prevStepRemainder = '';
  let currentDividend = 0;
  let currentDivisor = 0;
  for (
    let i = 0;
    i < dividendString.length && currentDigitIndex < dividendString.length;
    i += 1
  ) {
    if (
      prevStepRemainder !== '' &&
      +prevStepRemainder === 0 &&
      +dividendString[currentDigitIndex] < divisor
    ) {
      answers.push(prevStepRemainder + dividendString[currentDigitIndex]);
      answersWithPadding.push(
        answers[answers.length - 1]
          .toString()
          .padStart(currentDigitIndex + 1, '#')
      );
      answers.push('0');
      answersWithPadding.push(
        answers[answers.length - 1]
          .toString()
          .padStart(currentDigitIndex + 1, '#')
      );

      currentDividend = Number(
        prevStepRemainder + dividendString[currentDigitIndex]
      );
      currentDivisor = 0;
      prevStepRemainder = dividendString[currentDigitIndex];
      currentNumber = +prevStepRemainder;
      currentDigitIndex += 1;
      continue;
    }
    let skipSlice = false;
    if (prevStepRemainder !== '' && +prevStepRemainder === 0) {
      skipSlice = true;
    }
    if (i === 0) {
      while (
        currentNumber < divisor &&
        currentDigitIndex < dividendString.length
      ) {
        currentNumber = currentNumber * 10 + +dividendString[currentDigitIndex];
        currentDigitIndex += 1;
      }
    } else if (currentDigitIndex < dividendString.length) {
      if (currentNumber < divisor) {
        currentNumber = currentNumber * 10 + +dividendString[currentDigitIndex];
      }
      if (currentNumber < divisor) {
        answers.push(prevStepRemainder + dividendString[currentDigitIndex]);
        answersWithPadding.push(
          answers[answers.length - 1]
            .toString()
            .padStart(currentDigitIndex + 1, '#')
        );
        answers.push('0');
        answersWithPadding.push(
          answers[answers.length - 1]
            .toString()
            .padStart(currentDigitIndex + 1, '#')
        );

        currentDividend = Number(
          prevStepRemainder + dividendString[currentDigitIndex]
        );
        currentDivisor = 0;
        prevStepRemainder = Number(
          prevStepRemainder + dividendString[currentDigitIndex]
        ).toString();
        currentNumber = +prevStepRemainder;
        currentDigitIndex += 1;
        continue;
      } else {
        currentDigitIndex += 1;
      }
    }
    if (i > 0) {
      const finalCurrentNumber =
        prevStepRemainder +
        currentNumber
          .toString()
          .slice(skipSlice ? 0 : Number(prevStepRemainder).toString().length);
      answers.push(finalCurrentNumber);
      answersWithPadding.push(
        answers[answers.length - 1].toString().padStart(currentDigitIndex, '#')
      );
    }
    const closestMultiple = Math.floor(currentNumber / divisor) * divisor;
    answers.push(closestMultiple.toString());
    answersWithPadding.push(
      answers[answers.length - 1].toString().padStart(currentDigitIndex, '#')
    );

    const difference = (currentNumber - closestMultiple).toString();
    prevStepRemainder = addPaddingToDifference(currentNumber, closestMultiple)
      ? difference.padStart(currentNumber.toString().length, '0')
      : difference;
    currentDividend = currentNumber;
    currentDivisor = closestMultiple;
    currentNumber = +difference;
  }

  const remainder = (currentDividend - currentDivisor).toString();

  return {
    intermediateSteps: answers,
    quotient: Math.floor(dividend / divisor).toString(),
    intermediateStepsWithPadding: answersWithPadding,
    remainder: addPaddingToDifference(currentDividend, currentDivisor)
      ? remainder.padStart(currentDividend.toString().length, '0')
      : remainder,
  };
};

const getPaddedInterMediateStepsPattern = (
  intermediateSteps: string[],
  intermediateStepsWithPadding: string[]
) => {
  const finalAns: string[] = [];

  for (let i = 0; i < intermediateSteps.length; i += 1) {
    finalAns.push(
      intermediateSteps[i].padStart(intermediateStepsWithPadding[i].length, '#')
    );
  }

  return finalAns.join('|');
};

const divisionGrid1Answer = (
  question: QuestionPropsType,
  answer: LearnerResponse
): ValidationResult => {
  const { numbers } = question;

  const [dividend, divisor] = Object.values(numbers).map((num) =>
    parseInt(num, 10)
  );

  const {
    intermediateSteps,
    quotient,
    remainder,
    intermediateStepsWithPadding,
  } = getDivGrid1IntermediateStepsQuotientAndRemainder(dividend, divisor);

  const paddedIntermediateSteps = getPaddedInterMediateStepsPattern(
    intermediateSteps,
    intermediateStepsWithPadding
  );

  const paddedRemainder = remainder.toString().padStart(remainder.length, '0');
  const paddedQuotient = quotient.toString().padStart(quotient.length, '0');

  if (answer.answerIntermediate !== intermediateSteps.join('|'))
    return {
      result: false,
      correctAnswer: {
        answerIntermediate: {
          result: false,
          correctAnswer: paddedIntermediateSteps,
        },
        answerRemainder: {
          result: answer.remainder === paddedRemainder,
          correctAnswer: paddedRemainder.padStart(
            question.answers.answerRemainder.length,
            '#'
          ),
        },
        answerQuotient: {
          result: answer.quotient === paddedQuotient,
          correctAnswer: paddedQuotient.padStart(
            question.answers.answerQuotient.length,
            '#'
          ),
        },
      },
    };

  if (answer.remainder !== paddedRemainder)
    return {
      result: false,
      correctAnswer: {
        answerRemainder: {
          result: answer.remainder === paddedRemainder,
          correctAnswer: paddedRemainder.padStart(
            question.answers.answerRemainder.length,
            '#'
          ),
        },
        answerQuotient: {
          result: answer.quotient === paddedQuotient,
          correctAnswer: paddedQuotient.padStart(
            question.answers.answerQuotient.length,
            '#'
          ),
        },
      },
    };

  if (answer.quotient !== quotient.toString().padStart(quotient.length, '0'))
    return {
      result: false,
      correctAnswer: {
        answerQuotient: {
          result: answer.quotient === paddedQuotient,
          correctAnswer: paddedQuotient.padStart(
            question.answers.answerQuotient.length,
            '#'
          ),
        },
      },
    };

  return {
    result: true,
  };
};

const divisionFIBAnswer = (
  question: QuestionPropsType,
  answer: LearnerResponse
): ValidationResult => {
  const {
    answers: { fib_type: fibType, result },
  } = question;

  if (
    [FibType.FIB_STANDARD_WITH_IMAGE, FibType.FIB_STANDARD].includes(fibType!)
  ) {
    return { result: answer.result === result.toString() };
  }

  const quotient = (
    result as { quotient: string; remainder: string }
  )?.quotient?.toString();
  const remainder = (
    result as { quotient: string; remainder: string }
  )?.remainder?.toString();

  if (
    [
      FibType.FIB_QUOTIENT_REMAINDER_WITH_IMAGE,
      FibType.FIB_QUOTIENT_REMAINDER,
    ].includes(fibType!)
  ) {
    return {
      result: answer.quotient === quotient && answer.remainder === remainder,
      correctAnswer: {
        ...(answer.quotient !== quotient && {
          answerQuotient: {
            result: false,
            correctAnswer: remainder,
          },
        }),
        ...(answer.remainder !== remainder && {
          answerRemainder: {
            result: false,
            correctAnswer: quotient,
          },
        }),
      },
    };
  }

  return { result: true };
};

export const getIsAnswerCorrect = (
  question: QuestionPropsType,
  answer: LearnerResponse
) => {
  if (question.questionType === QuestionType.MCQ) {
    return mcqAnswer(question, answer);
  }

  if (question.questionType === QuestionType.GRID_2) {
    return grid2Answer(question, answer);
  }

  switch (`${question.operation}_${question.questionType}`) {
    case 'Addition_Grid-1':
      return addGrid1Answer(question, answer);
    case 'Addition_Fib':
      return addFIBAnswer(question, answer);

    case 'Subtraction_Grid-1':
      return subGrid1Answer(question, answer);
    case 'Subtraction_Fib':
      return subFIBAnswer(question, answer);

    case 'Multiplication_Grid-1':
      return multiplicationGrid1Answer(question, answer);
    case 'Multiplication_Fib':
      return multiplicationFIBAnswer(question, answer);

    case 'Division_Grid-1':
      return divisionGrid1Answer(question, answer);
    case 'Division_Fib':
      return divisionFIBAnswer(question, answer);

    default:
      return { result: undefined, correctAnswer: undefined };
  }
};

const validationResToLearnerResMap: Record<
  keyof Required<ValidationResult>['correctAnswer'],
  string
> = {
  topAnswer: 'answerTop',
  resultAnswer: 'result',
  answerQuotient: 'quotient',
  answerRemainder: 'remainder',
  answerIntermediate: 'answerIntermediate',
  row1Answers: 'answerTop',
  row2Answers: 'result',
};

const compareStrings = (s1: string = '', s2: string = ''): boolean[] => {
  const result: boolean[] = [];

  const updatedS1 = s1.padStart(s2.length, '#');
  const updatedS2 = s2.padStart(s1.length, '#');

  for (let i = 0; i < updatedS2.length; i += 1) {
    result.push(updatedS1[i] !== updatedS2[i]);
  }

  return result;
};

export const getQuestionErrors = (
  operationType: ArithmaticOperations,
  learnerResponse: LearnerResponse,
  correctAnswer: ValidationResult['correctAnswer']
) => {
  const res = {} as Record<string, boolean[] | boolean[][]>;
  // eslint-disable-next-line consistent-return
  Object.keys(correctAnswer ?? {}).forEach((key) => {
    const correctAnswerVal = correctAnswer?.[key as keyof typeof correctAnswer];

    if (!correctAnswerVal || correctAnswerVal?.result) return;

    const learnerKey =
      validationResToLearnerResMap[
        key as keyof typeof validationResToLearnerResMap
      ];
    const learnerResp =
      learnerResponse[learnerKey as keyof typeof learnerResponse];
    const correctAnsResp = correctAnswerVal?.correctAnswer;

    if (
      key === 'topAnswer' &&
      operationType === ArithmaticOperations.SUBTRACTION
    ) {
      const correctAnsArr = correctAnsResp?.split('|') ?? [];
      const learnerRespArr = learnerResp?.split('|') ?? [];

      const resArray = [];

      for (let i = 0; i < correctAnsArr.length; i += 1) {
        if (learnerRespArr[i].length <= correctAnsArr[i].length) {
          resArray.push(
            learnerRespArr[i].padStart(correctAnsArr[i].length, '0') !==
              correctAnsArr[i]
          );
        } else {
          resArray.push(
            correctAnsArr[i].padStart(learnerRespArr[i].length, '0') !==
              learnerRespArr[i]
          );
        }
      }

      res[key] = resArray;
      return;
    }

    if (key !== 'answerIntermediate') {
      res[key] = compareStrings(learnerResp, correctAnsResp);
      return;
    }

    let correctAnswerParts: string[] = [];
    let learnerRespParts: string[] = [];

    if (operationType === ArithmaticOperations.MULTIPLICATION) {
      correctAnswerParts = correctAnsResp?.split('#').reverse() ?? [];
      learnerRespParts = learnerResp?.split('#') ?? [];
    }

    if (operationType === ArithmaticOperations.DIVISION) {
      correctAnswerParts = correctAnsResp?.split('|') ?? [];
      learnerRespParts = learnerResp?.split('|') ?? [];
    }

    if (correctAnswerParts.length !== learnerRespParts.length) return;

    const partsArr = [];

    for (let i = 0; i < correctAnswerParts?.length; i += 1) {
      partsArr.push(compareStrings(learnerRespParts[i], correctAnswerParts[i]));
    }

    res[key] = partsArr;
  });
  return res;
};
