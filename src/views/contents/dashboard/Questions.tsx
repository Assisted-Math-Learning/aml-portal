/* eslint-disable no-nested-ternary */
import { useLanguage } from 'context/LanguageContext';
import useEnterKeyHandler from 'hooks/useEnterKeyHandler';
import useWindowSize from 'hooks/useWindowSize';
import {
  ArithmaticOperations,
  operationMap,
} from 'models/enums/ArithmaticOperations.enum';
import { FibType, QuestionType } from 'models/enums/QuestionType.enum';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { useDispatch, useSelector } from 'react-redux';
import QuestionContainer from 'shared-resources/components/ContainerLayout/QuestionContainer';
import Loader from 'shared-resources/components/Loader/Loader';
import MultiLangText, {
  getTranslatedString,
} from 'shared-resources/components/MultiLangText/MultiLangText';
import Question from 'shared-resources/components/Question';
import QuestionButtonsComponent from 'shared-resources/components/QuestionButtonsComponent/QuestionButtonsComponent';
import {
  ClickedButtonType,
  FeedbackType,
  getButtonText,
  getButtonTooltipMessage,
  getFilteredAnswer,
} from 'shared-resources/components/questionUtils';
import {
  convertSingleResponseToLearnerResponse,
  transformQuestions,
} from 'shared-resources/utils/helpers';
import {
  getIsAnswerCorrect,
  getQuestionErrors,
} from 'shared-resources/utils/logicHelper';
import { fetchLogicEngineEvaluation } from 'store/actions/logicEngineEvaluation.action';
import { syncFinalLearnerResponse } from 'store/actions/syncLearnerResponse.action';
import { learnerIdSelector } from 'store/selectors/auth.selector';
import { learnerJourneySelector } from 'store/selectors/learnerJourney.selector';
import { islogicEngineLoadingSelector } from 'store/selectors/logicEngine.selector';
import { questionsSetSelector } from 'store/selectors/questionSet.selector';
import {
  isIntermediateSyncInProgressSelector,
  isSyncInProgressSelector,
} from 'store/selectors/syncResponseSelector';
import { multiLangLabels } from 'utils/constants/multiLangLabels.constants';
import { indexedDBService } from '../../../services/IndexedDBService';
import { IDBDataStatus } from '../../../types/enum';
import { TelemetryDataEventType } from '../../../models/enums/telemetryDataEventType.enum';

type Props = {
  onAssess?: (eventType: TelemetryDataEventType, data?: any) => void;
};

const Questions: React.FC<Props> = ({ onAssess }) => {
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

  const [currentQuestionFeedback, setCurrentQuestionFeedback] =
    useState<FeedbackType | null>(null);
  const clickedButtonRef = useRef<ClickedButtonType | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentQuestionErrors, setCurrentQuestionErrors] = useState<{
    [key: string]: boolean[] | boolean[][];
  }>({});
  const lastAttemptedQuestionIndex = useRef<number>(0);

  const currentQuestion = questions[currentQuestionIndex];

  const isFeedbackAllowed = questionSet?.enable_feedback;

  const resetFeedbackStates = useCallback(() => {
    setCurrentQuestionFeedback(null);
    setCurrentQuestionErrors({});
    setShowFeedback(false);
  }, []);

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
            const index =
              firstUnansweredIndex !== -1 ? firstUnansweredIndex : 0;
            setCurrentQuestionIndex(index);
            lastAttemptedQuestionIndex.current = index;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learnerId]);

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
    resetFeedbackStates();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentQuestionIndex,
    evaluateLearner,
    isCompleted,
    isIntermediatelySyncing,
    isSyncing,
    learnerId,
    questionSet,
    questions.length,
  ]);

  useEffect(() => {
    let timer: any;
    if (showFeedback) {
      const skipFunction = async () => {
        const isLatestQuestion =
          currentQuestionIndex === lastAttemptedQuestionIndex.current;

        const isLatestQuestionCorrectOrNoOP =
          (currentQuestionFeedback === FeedbackType.CORRECT ||
            currentQuestionFeedback === FeedbackType.NOOP) &&
          isLatestQuestion;

        if (isLatestQuestionCorrectOrNoOP) {
          clickedButtonRef.current = ClickedButtonType.NEXT;
          await handleNextClick();
          setShowFeedback(false);
        }
      };

      if (!isFeedbackAllowed) {
        skipFunction();
        return;
      }

      clearTimeout(timer);
      timer = setTimeout(skipFunction, 2000);
    }
  }, [
    currentQuestion?.questionType,
    currentQuestionFeedback,
    currentQuestionIndex,
    handleNextClick,
    isFeedbackAllowed,
    showFeedback,
  ]);

  useEffect(() => {
    if (
      !isFeedbackAllowed ||
      currentQuestionIndex < lastAttemptedQuestionIndex.current
    ) {
      clickedButtonRef.current = ClickedButtonType.CHECK;
      setTimeout(() => {
        questionRef.current?.submitForm();
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex]);

  const handleQuestionSubmit = () => {
    questionRef.current?.resetForm();
    if (currentQuestionIndex === lastAttemptedQuestionIndex.current) {
      lastAttemptedQuestionIndex.current = currentQuestionIndex + 1;
      setCurrentQuestionIndex((prev) => prev + 1);
    }
    resetFeedbackStates();
  };

  const handleCheckQuestion = async (
    criteria: any,
    transformedAnswer?: any,
    updateIDB = false
  ) => {
    const { result: isAnswerCorrect, correctAnswer } = getIsAnswerCorrect(
      currentQuestion,
      transformedAnswer.learner_response
    );

    const syncedEntryExists = (await indexedDBService.queryObjectsByKeys(
      criteria
    )) as any[];

    if (!isFeedbackAllowed) {
      setShowFeedback(true);
      setCurrentQuestionFeedback(FeedbackType.NOOP);
    }

    if (isFeedbackAllowed && isAnswerCorrect) {
      setCurrentQuestionFeedback(FeedbackType.CORRECT);
      setCurrentQuestionErrors({});
      setShowFeedback(true);
    } else if (isFeedbackAllowed && !isAnswerCorrect) {
      setCurrentQuestionFeedback(FeedbackType.INCORRECT);
      setShowFeedback(true);

      if (
        [QuestionType.GRID_1, QuestionType.GRID_2].includes(
          currentQuestion?.questionType!
        ) ||
        (currentQuestion?.questionType === QuestionType.FIB &&
          currentQuestion?.operation === ArithmaticOperations.DIVISION &&
          [
            FibType.FIB_QUOTIENT_REMAINDER,
            FibType.FIB_QUOTIENT_REMAINDER_WITH_IMAGE,
          ].includes(currentQuestion?.answers?.fib_type))
      ) {
        setCurrentQuestionErrors(
          getQuestionErrors(
            currentQuestion?.operation,
            transformedAnswer.learner_response,
            correctAnswer
          )
        );
      }
    }

    if (!updateIDB) return;

    // if question is synced in IDB or questionId in completed questions array,
    // then update the question in IDB with status as REVISITED else do no update the status

    if (syncedEntryExists && syncedEntryExists.length) {
      await indexedDBService.updateObjectById(syncedEntryExists[0].id, {
        ...transformedAnswer,
        learner_id: learnerId,
        status:
          syncedEntryExists[0].status === IDBDataStatus.SYNCED
            ? IDBDataStatus.REVISITED
            : syncedEntryExists[0].status,
      });
      return;
    }

    const questionIdInCompletedQuestions =
      learnerJourney?.completed_question_ids?.some(
        (id) => id === criteria.question_id
      );

    await indexedDBService.addObject({
      ...transformedAnswer,
      learner_id: learnerId,
      status: questionIdInCompletedQuestions
        ? IDBDataStatus.REVISITED
        : IDBDataStatus.NOOP,
    });
  };

  const handleQuestionFormSubmit = async (gridData: any) => {
    const filteredAnswer = getFilteredAnswer(
      gridData,
      lastAttemptedQuestionIndex.current,
      questions.length
    );
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

    if (clickedButtonRef.current === ClickedButtonType.CHECK_AND_SUBMIT) {
      handleCheckQuestion(criteria, transformedAnswer, true);
    }

    if (
      clickedButtonRef.current === ClickedButtonType.CHECK &&
      currentQuestionIndex < lastAttemptedQuestionIndex.current
    ) {
      handleCheckQuestion(criteria, transformedAnswer);
    }

    if (
      clickedButtonRef.current === ClickedButtonType.SKIP ||
      clickedButtonRef.current === ClickedButtonType.NEXT
    ) {
      handleQuestionSubmit();
    }

    clickedButtonRef.current = null;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isCompleted) {
      clickedButtonRef.current = ClickedButtonType.NEXT;
      onAssess?.(TelemetryDataEventType.NEXT_SET_BUTTON_CLICKED);
      handleNextClick();
      return;
    }
    if (questionRef.current && !isSyncing && !currentQuestionFeedback) {
      resetFeedbackStates();
      onAssess?.(TelemetryDataEventType.SUBMIT_BUTTON_CLICKED, {
        currentQuestionSet: questionSet?.identifier,
        currentQuestion: currentQuestion?.questionId,
        currentQuestionIndex,
      });
      clickedButtonRef.current = ClickedButtonType.CHECK_AND_SUBMIT;
      questionRef.current.submitForm();
    }
    event.preventDefault();
  };

  useEnterKeyHandler(handleKeyDown, [isFormValid, isCompleted]);

  const handleKeyClick = (key: string) => {
    if (showFeedback) {
      setCurrentQuestionFeedback(null);
      setShowFeedback(false);
    }
    setKeyPressed((prev) => ({ key, counter: prev.counter + 1 }));
  };

  const handleBackSpaceClick = (clicked: any) => {
    if (showFeedback) {
      setCurrentQuestionFeedback(null);
      setShowFeedback(false);
    }
    setBackSpacePressed((prev) => ({
      isBackSpaced: clicked,
      counter: prev.counter + 1,
    }));
  };

  const handlePrevClick = () => {
    if (currentQuestionIndex > 0) {
      resetFeedbackStates();
      onAssess?.(TelemetryDataEventType.PREVIOUS_ARROW_BUTTON_CLICKED, {
        currentQuestionSet: questionSet?.identifier,
        currentQuestion: currentQuestion?.questionId,
        currentQuestionIndex,
      });
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSkipClicked = () => {
    if (currentQuestionIndex < lastAttemptedQuestionIndex.current) {
      resetFeedbackStates();
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrimaryButtonClicked = useCallback(() => {
    setShowFeedback(false);
    if (isCompleted) {
      onAssess?.(TelemetryDataEventType.NEXT_SET_BUTTON_CLICKED);
      handleNextClick();
      return;
    }
    if (!currentQuestionFeedback) {
      onAssess?.(TelemetryDataEventType.SUBMIT_BUTTON_CLICKED, {
        currentQuestionSet: questionSet?.identifier,
        currentQuestion: currentQuestion?.questionId,
        currentQuestionIndex,
      });
      clickedButtonRef.current = ClickedButtonType.CHECK_AND_SUBMIT;
      questionRef.current?.submitForm();
    }
  }, [
    isCompleted,
    currentQuestionFeedback,
    questionSet?.identifier,
    currentQuestion?.identifier,
    currentQuestionIndex,
  ]);

  const handleSkipQuestionClicked = useCallback(() => {
    setShowFeedback(false);
    clickedButtonRef.current = ClickedButtonType.SKIP;
    questionRef.current?.submitForm();
  }, []);

  const handleSkipToCurrentClicked = useCallback(() => {
    resetFeedbackStates();
    setCurrentQuestionIndex(lastAttemptedQuestionIndex.current ?? 0);
  }, [resetFeedbackStates]);

  if (isSyncing || isLogicEngineLoading)
    return (
      <div className='flex justify-center items-center w-full h-full '>
        <Loader />
      </div>
    );

  return (
    <>
      {isCompleted && <Confetti width={width} height={height} />}
      <QuestionContainer
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
                onValidityChange={(value: boolean) => {
                  setIsFormValid(value);
                }}
                keyPressed={keyPressed}
                backSpacePressed={backSpacePressed}
                setQuestionFeedback={() => {
                  setShowFeedback(false);
                  setCurrentQuestionFeedback(null);
                }}
                questionFeedback={currentQuestionFeedback}
              />
            ) : (
              ''
            )}
          </div>
        }
        onKeyClick={handleKeyClick}
        onBackSpaceClick={handleBackSpaceClick}
        currentQuestion={currentQuestion}
        taxonomy={questionSet?.taxonomy}
        renderButtons={
          <QuestionButtonsComponent
            primaryButtonText={getButtonText(language, isSyncing, isCompleted)}
            primaryButtonTooltipMessage={getButtonTooltipMessage(
              language,
              isSyncing,
              currentQuestion?.questionType,
              currentQuestionFeedback
            )}
            disablePrimaryButton={
              isSyncing ||
              Boolean(currentQuestionFeedback) ||
              (!isFormValid && !isCompleted)
            }
            disabledSecondaryButtons={isSyncing}
            onPrimaryButtonClicked={handlePrimaryButtonClicked}
            onSkipQuestionClicked={() => {
              onAssess?.(TelemetryDataEventType.SKIP_BUTTON_CLICKED, {
                currentQuestionSet: questionSet?.identifier,
                currentQuestion: currentQuestion?.questionId,
                currentQuestionIndex,
              });
              handleSkipQuestionClicked();
            }}
            onSkipToCurrentClick={() => {
              onAssess?.(
                TelemetryDataEventType.SKIP_TO_CURRENT_BUTTON_CLICKED,
                {
                  currentQuestionSet: questionSet?.identifier,
                  currentQuestion: currentQuestion?.questionId,
                  currentQuestionIndex,
                }
              );
              handleSkipToCurrentClicked();
            }}
            showSkipToCurrentButton={
              lastAttemptedQuestionIndex.current !== currentQuestionIndex
            }
            showSkipQuestionButton={
              !isCompleted && currentQuestionFeedback === FeedbackType.INCORRECT
            }
          />
        }
        lastAttemptedQuestionIndex={lastAttemptedQuestionIndex.current}
        onPrevClick={handlePrevClick}
        onSkipClicked={() => {
          onAssess?.(TelemetryDataEventType.NEXT_ARROW_BUTTON_CLICKED, {
            currentQuestionSet: questionSet?.identifier,
            currentQuestion: currentQuestion?.questionId,
            currentQuestionIndex,
          });
          handleSkipClicked();
        }}
        currentQuestionFeedback={currentQuestionFeedback}
        showFeedback={Boolean(isFeedbackAllowed && showFeedback)}
      />
    </>
  );
};

export default Questions;
