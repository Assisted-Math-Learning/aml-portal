/* eslint-disable no-nested-ternary */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ContainerLayout from 'shared-resources/components/ContainerLayout/ContainerLayout';
import Question from 'shared-resources/components/Question';
import {
  convertSingleResponseToLearnerResponse,
  transformQuestions,
} from 'shared-resources/utils/helpers';
import { fetchLogicEngineEvaluation } from 'store/actions/logicEngineEvaluation.action';
import { syncFinalLearnerResponse } from 'store/actions/syncLearnerResponse.action';
import { learnerIdSelector } from 'store/selectors/auth.selector';
import { learnerJourneySelector } from 'store/selectors/learnerJourney.selector';
import { questionsSetSelector } from 'store/selectors/questionSet.selector';
import Confetti from 'react-confetti';
import useWindowSize from 'hooks/useWindowSize';
import { QuestionType } from 'models/enums/QuestionType.enum';
import {
  isIntermediateSyncInProgressSelector,
  isSyncInProgressSelector,
} from 'store/selectors/syncResponseSelector';
import { islogicEngineLoadingSelector } from 'store/selectors/logicEngine.selector';
import Loader from 'shared-resources/components/Loader/Loader';
import useEnterKeyHandler from 'hooks/useEnterKeyHandler';
import _ from 'lodash';
import { operationMap } from 'models/enums/ArithmaticOperations.enum';
import { useLanguage } from 'context/LanguageContext';
import MultiLangText, {
  getTranslatedString,
} from 'shared-resources/components/MultiLangText/MultiLangText';
import { multiLangLabels } from 'utils/constants/multiLangLabels.constants';
import {
  getIsAnswerCorrect,
  getQuestionErrors,
} from 'shared-resources/utils/logicHelper';
import Button from 'shared-resources/components/Button/Button';
import { indexedDBService } from '../../../services/IndexedDBService';
import { IDBDataStatus, SupportedLanguages } from '../../../types/enum';

const getButtonText = (
  language: keyof typeof SupportedLanguages,
  isSyncing: boolean,
  isCompleted: boolean,
  currentQuestionFeedback: string | null,
  currentQuestionType: QuestionType
) => {
  if (isSyncing) return getTranslatedString(language, multiLangLabels.syncing);

  if (isCompleted)
    return getTranslatedString(language, multiLangLabels.next_set);

  if (currentQuestionFeedback === 'incorrect') return 'Try Again';

  if (currentQuestionType === QuestionType.MCQ)
    return getTranslatedString(language, multiLangLabels.next);

  return 'Check';
};

const getButtonTooltipMessage = (
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

const Questions: React.FC = () => {
  const { language } = useLanguage();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false); // State to track if the set is completed
  const [waitingBeforeEvaluation, setWaitingBeforeEvaluation] = useState(false); // State to track if the set is completed
  const questionSet = useSelector(questionsSetSelector);
  const learnerId = useSelector(learnerIdSelector);
  const learnerJourney = useSelector(learnerJourneySelector);
  const isSyncing = useSelector(isSyncInProgressSelector);
  const isIntermediatelySyncing = useSelector(
    isIntermediateSyncInProgressSelector
  );
  const dispatch = useDispatch();
  const questionRef = useRef<{
    submitForm: () => void;
    resetForm: () => void;
  } | null>(null);
  const { width, height } = useWindowSize();
  const isLogicEngineLoading = useSelector(islogicEngineLoadingSelector);
  const [keyPressed, setKeyPressed] = useState<{
    key: string;
    counter: number;
  }>({ key: '', counter: 0 });
  const [backSpacePressed, setBackSpacePressed] = useState<{
    isBackSpaced: boolean;
    counter: number;
  }>({ isBackSpaced: false, counter: 0 });

  const [currentQuestionFeedback, setCurrentQuestionFeedback] = useState<
    'correct' | 'incorrect' | null
  >(null);
  const clickedButtonRef = useRef<
    'skip' | 'check' | 'next' | 'try-again' | null
  >(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentQuestionErrors, setCurrentQuestionErrors] = useState<{
    [key: string]: boolean[] | boolean[][];
  }>({});

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const makeInitialDecisions = async () => {
      if (questionSet?.questions) {
        const { questions: allQuestions } = questionSet;
        setIsCompleted(false);
        if (allQuestions) {
          const transformedQuestions = transformQuestions(allQuestions);
          const savedResponses = await indexedDBService.queryObjectsByKey(
            'learner_id',
            learnerId
          );
          const localStorageAnsweredIds =
            savedResponses?.map((response: any) => response.question_id) || [];
          const apiAnsweredIds = learnerJourney?.completed_question_ids || [];
          const combinedAnsweredIds = [
            ...new Set([...apiAnsweredIds, ...localStorageAnsweredIds]),
          ];

          const allAnswered = transformedQuestions.every((question: any) =>
            combinedAnsweredIds.includes(question.questionId)
          );
          if (allAnswered) {
            setIsCompleted(true);
          } else {
            const firstUnansweredIndex = transformedQuestions.findIndex(
              (question: any) =>
                !combinedAnsweredIds.includes(question.questionId)
            );
            setQuestions(transformedQuestions);
            setCurrentQuestionIndex(
              firstUnansweredIndex !== -1 ? firstUnansweredIndex : 0
            );
          }
        }
      }
    };

    makeInitialDecisions();
  }, [questionSet, learnerJourney, learnerId]);

  useEffect(() => {
    const syncData = () => {
      if (learnerId && !isIntermediatelySyncing && !isSyncing && questionSet) {
        dispatch(syncFinalLearnerResponse());
      }
    };

    if (questions.length > 0 && currentQuestionIndex === questions.length) {
      syncData();
      setIsCompleted(true); // to be moved in store
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, learnerId, questions, questionSet]);

  const evaluateLearner = useCallback(() => {
    if (learnerId) {
      dispatch(
        fetchLogicEngineEvaluation({
          learnerId: String(learnerId),
          goToInstructions: true,
        })
      );
    }
  }, [dispatch, learnerId]);

  useEffect(() => {
    /**
     * handling the case when after completing the question set, some questions' data is not yet synced
     * after syncing it, then only we call evaluate API
     */
    if (!isSyncing && isCompleted && waitingBeforeEvaluation) {
      evaluateLearner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waitingBeforeEvaluation, isSyncing, isCompleted, learnerId]);

  const handleNextClick = useCallback(async () => {
    setCurrentQuestionErrors({});
    setCurrentQuestionFeedback(null);

    if (clickedButtonRef.current === 'try-again') {
      questionRef.current?.resetForm();
      return;
    }

    if (isCompleted && learnerId) {
      const criteria = {
        status: IDBDataStatus.NOOP,
        learner_id: learnerId,
      };
      const learnerResponseData = (await indexedDBService.queryObjectsByKeys(
        criteria
      )) as any[];
      if (
        learnerResponseData.length &&
        questionSet &&
        !isIntermediatelySyncing &&
        !isSyncing
      ) {
        /**
         * handling the case when after completing the question set, some questions' data is not yet synced
         * so syncing it before calling evaluate API
         */
        dispatch(syncFinalLearnerResponse());
        setWaitingBeforeEvaluation(true);
        return;
      }
      evaluateLearner();
    } else if (questions.length === currentQuestionIndex + 1) {
      if (questionRef.current) {
        questionRef.current.submitForm();
      }
    } else if (questionRef.current) {
      questionRef.current.submitForm();
    }
  }, [
    currentQuestionIndex,
    dispatch,
    evaluateLearner,
    isCompleted,
    isIntermediatelySyncing,
    isSyncing,
    learnerId,
    questionSet,
    questions.length,
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showFeedback) {
      timer = setTimeout(async () => {
        if (
          currentQuestionFeedback === 'correct' ||
          currentQuestion?.questionType === QuestionType.MCQ
        ) {
          clickedButtonRef.current = 'next';
          await handleNextClick();
        }
        setShowFeedback(false);
      }, 700);
    }
    return () => clearTimeout(timer);
  }, [
    currentQuestion?.questionType,
    currentQuestionFeedback,
    handleNextClick,
    showFeedback,
  ]);

  const handleQuestionSubmit = async (
    criteria: any,
    transformedAnswer: any
  ) => {
    const entryExists = (await indexedDBService.queryObjectsByKeys(
      criteria
    )) as any[];

    if (entryExists && entryExists.length) {
      await indexedDBService.updateObjectById(entryExists[0].id, {
        ...transformedAnswer,
        learner_id: learnerId,
        status: IDBDataStatus.NOOP,
      });
    } else {
      await indexedDBService.addObject({
        ...transformedAnswer,
        learner_id: learnerId,
        status: IDBDataStatus.NOOP,
      });
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    setCurrentQuestionErrors({});
    setCurrentQuestionFeedback(null);
  };

  const handleCheckQuestion = async (transformedAnswer?: any) => {
    const { result: isAnswerCorrect, correctAnswer } = getIsAnswerCorrect(
      currentQuestion,
      transformedAnswer.learner_response
    );

    if (isAnswerCorrect) {
      setCurrentQuestionFeedback('correct');
      setCurrentQuestionErrors({});
      setShowFeedback(true);
    } else {
      setCurrentQuestionFeedback('incorrect');
      setShowFeedback(true);
      if (currentQuestion?.questionType === QuestionType.GRID_1) {
        setCurrentQuestionErrors(
          getQuestionErrors(
            currentQuestion?.operation,
            transformedAnswer.learner_response,
            correctAnswer
          )
        );
      }
    }
  };

  const handleQuestionFormSubmit = async (gridData: any) => {
    const currentTime = new Date().toISOString();
    const newAnswer = {
      ...gridData,
      start_time: currentQuestionIndex === 0 ? currentTime : '',
      end_time:
        currentQuestionIndex === questions.length - 1 ? currentTime : '',
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
    const transformedAnswer = convertSingleResponseToLearnerResponse(
      filteredAnswer,
      questionSet!.identifier,
      currentQuestion.answers?.answerIntermediate
    );

    const criteria = {
      question_id: filteredAnswer.questionId,
      question_set_id: questionSet!.identifier,
      learner_id: learnerId,
    };

    if (clickedButtonRef.current === 'check') {
      handleCheckQuestion(transformedAnswer);
    }

    if (
      clickedButtonRef.current === 'skip' ||
      clickedButtonRef.current === 'next'
    ) {
      handleQuestionSubmit(criteria, transformedAnswer);
    }

    clickedButtonRef.current = null;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isCompleted) {
      clickedButtonRef.current = 'next';
      handleNextClick();
    }
    if (questionRef.current && isFormValid) {
      setCurrentQuestionFeedback(null);
      clickedButtonRef.current = 'check';
      questionRef.current.submitForm();
    }
    event.preventDefault();
  };

  useEnterKeyHandler(handleKeyDown, [isFormValid, isCompleted]);

  const handleKeyClick = useCallback(
    (key: string) => {
      if (currentQuestionFeedback === 'incorrect') return;
      setKeyPressed((prev) => ({ key, counter: prev.counter + 1 }));
    },
    [currentQuestionFeedback]
  );

  const handleBackSpaceClick = (clicked: any) => {
    if (currentQuestionFeedback === 'incorrect') return;
    setBackSpacePressed((prev) => ({
      isBackSpaced: clicked,
      counter: prev.counter + 1,
    }));
  };

  if (isSyncing || isLogicEngineLoading)
    return (
      <div className='flex justify-center items-center h-[80vh] '>
        <Loader />
      </div>
    );

  return (
    <>
      {isCompleted && <Confetti width={width} height={height} />}
      <ContainerLayout
        headerText={
          isCompleted
            ? getTranslatedString(language, multiLangLabels.congratulations)
            : questions[currentQuestionIndex]?.questionType ===
              QuestionType.GRID_2
            ? `${getTranslatedString(
                language,
                questions[currentQuestionIndex]?.description
              )}: ${Object.values(
                questions?.[currentQuestionIndex]?.numbers || {}
              ).join(
                operationMap[questions?.[currentQuestionIndex].operation]
              )}`
            : getTranslatedString(
                language,
                questions[currentQuestionIndex]?.description
              ) || ''
        }
        currentQuestionIndex={currentQuestionIndex}
        questionsLength={questions.length}
        showAttemptCount={!isCompleted}
        content={
          <div className='text-4xl font-semibold text-headingTextColor'>
            {isCompleted ? (
              <div>
                <MultiLangText
                  component='p'
                  labelMap={
                    multiLangLabels.congratulations_youve_completed_this_question_set
                  }
                />
                <MultiLangText
                  component='p'
                  labelMap={
                    multiLangLabels.click_next_to_move_on_to_the_next_question_set
                  }
                />
              </div>
            ) : questions.length && currentQuestion ? (
              <Question
                ref={questionRef}
                errors={currentQuestionErrors}
                question={questions[currentQuestionIndex]}
                onSubmit={handleQuestionFormSubmit}
                onValidityChange={(value: boolean) => setIsFormValid(value)}
                keyPressed={keyPressed}
                backSpacePressed={backSpacePressed}
                questionFeedback={currentQuestionFeedback}
                showFeedback={showFeedback}
              />
            ) : (
              ''
            )}
          </div>
        }
        onKeyClick={handleKeyClick}
        onBackSpaceClick={handleBackSpaceClick}
        currentQuestion={currentQuestion}
        noKeyboard={isCompleted}
        taxonomy={questionSet?.taxonomy}
        hasMultipleButtons
        renderButtons={
          <div className='flex h-full flex-col gap-4 items-center'>
            {!isCompleted &&
              currentQuestion?.questionType !== QuestionType.MCQ &&
              currentQuestionFeedback === 'incorrect' && (
                <Button
                  type='button'
                  tabIndex={0}
                  disabled={isSyncing}
                  className='focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md'
                  onClick={() => {
                    clickedButtonRef.current = 'skip';
                    questionRef.current?.submitForm();
                  }}
                >
                  Skip
                </Button>
              )}
            <Button
              tabIndex={0}
              type='button'
              className='focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md'
              onClick={() => {
                if (isCompleted) {
                  handleNextClick();
                  return;
                }
                if (!currentQuestionFeedback) {
                  clickedButtonRef.current = 'check';
                  questionRef.current?.submitForm();
                } else if (currentQuestionFeedback === 'incorrect') {
                  clickedButtonRef.current = 'try-again';
                  handleNextClick();
                }
              }}
              disabled={isSyncing || (!isFormValid && !isCompleted)}
              tooltipMessage={getButtonTooltipMessage(
                language,
                isSyncing,
                currentQuestion?.questionType
              )}
            >
              {getButtonText(
                language,
                isSyncing,
                isCompleted,
                currentQuestionFeedback,
                currentQuestion?.questionType
              )}
            </Button>
          </div>
        }
      />
    </>
  );
};

export default Questions;
