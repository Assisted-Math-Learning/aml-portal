/* eslint-disable no-nested-ternary */
import React, { useEffect, useState, useRef } from 'react';
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
import { indexedDBService } from '../../../services/IndexedDBService';
import { IDBDataStatus } from '../../../types/enum';

const Questions: React.FC = () => {
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
  const questionRef = useRef<{ submitForm: () => void } | null>(null);
  const { width, height } = useWindowSize();
  const isLogicEngineLoading = useSelector(islogicEngineLoadingSelector);
  const [keyPressed, setKeyPressed] = useState<string>();
  const [backSpacePressed, setBackSpacePressed] = useState<boolean>();

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
        dispatch(syncFinalLearnerResponse(learnerId, questionSet.identifier));
      }
    };

    if (questions.length > 0 && currentQuestionIndex === questions.length) {
      syncData();
      setIsCompleted(true); // to be moved in store
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, learnerId, questions, questionSet]);

  const evaluateLearner = () => {
    if (learnerId) {
      dispatch(
        fetchLogicEngineEvaluation({
          learnerId: String(learnerId),
          goToInstructions: true,
        })
      );
    }
  };

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

  const handleNextClick = async () => {
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
        dispatch(syncFinalLearnerResponse(learnerId, questionSet.identifier));
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
  };

  const handleQuestionSubmit = async (gridData: any) => {
    const currentTime = new Date().toISOString();
    const newAnswer = {
      topAnswer: gridData.topAnswer,
      resultAnswer: gridData.resultAnswer,
      row1Answers: gridData?.row1Answers,
      row2Answers: gridData?.row2Answers,
      fibAnswer: gridData?.fibAnswer,
      mcqAnswer: gridData?.mcqAnswer,
      questionId: gridData.questionId,
      start_time: currentQuestionIndex === 0 ? currentTime : '',
      end_time:
        currentQuestionIndex === questions.length - 1 ? currentTime : '',
    };

    const filteredAnswer = {
      questionId: newAnswer.questionId,
      start_time: newAnswer.start_time,
      end_time: newAnswer.end_time,
      answers: Object.fromEntries(
        Object.entries({
          topAnswer: newAnswer.topAnswer,
          resultAnswer: newAnswer.resultAnswer,
          row1Answers: newAnswer?.row1Answers,
          row2Answers: newAnswer?.row2Answers,
          fibAnswer: newAnswer?.fibAnswer,
          mcqAnswer: newAnswer?.mcqAnswer,
        }).filter(([, value]) => value !== undefined)
      ),
    };

    const transformedAnswer = convertSingleResponseToLearnerResponse(
      filteredAnswer,
      questionSet!.identifier
    );

    const criteria = {
      question_id: filteredAnswer.questionId,
      question_set_id: questionSet!.identifier,
      learner_id: learnerId,
    };
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
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (isSyncing || isLogicEngineLoading)
    return (
      <div className='flex justify-center items-center h-[80vh] '>
        <Loader />
      </div>
    );

  const handleKeyClick = (key: string) => {
    setKeyPressed(key);
  };

  const handleBackSpaceClick = (clicked: any) => {
    setBackSpacePressed(clicked);
  };

  return (
    <>
      {isCompleted && <Confetti width={width} height={height} />}
      <ContainerLayout
        headerText={
          isCompleted
            ? 'Congratulations!'
            : questions[currentQuestionIndex]?.questionType ===
              QuestionType.GRID_2
            ? `${
                questions[currentQuestionIndex]?.description?.en
              }: ${Object.values(
                questions?.[currentQuestionIndex]?.numbers || {}
              ).join(' + ')}`
            : questions[currentQuestionIndex]?.description?.en || ''
        }
        content={
          <div className='text-4xl font-semibold text-headingTextColor'>
            {isCompleted ? (
              <div>
                <p>Congratulations! You've completed this question set.</p>
                <p>Click "Next" to move on to the next question set.</p>
              </div>
            ) : questions.length && currentQuestion ? (
              <Question
                ref={questionRef}
                question={questions[currentQuestionIndex]}
                onSubmit={(gridData) => handleQuestionSubmit(gridData)}
                onValidityChange={(value: boolean) => setIsFormValid(value)}
                keyPressed={keyPressed}
                backSpacePressed={backSpacePressed}
              />
            ) : (
              ''
            )}
          </div>
        }
        buttonText={
          isSyncing ? 'Syncing...' : isCompleted ? 'Next Set' : 'Next'
        }
        onButtonClick={handleNextClick}
        buttonDisabled={isSyncing || (!isCompleted && !isFormValid)}
        toolTipMessage={
          isSyncing
            ? 'Sync in progress'
            : questions[currentQuestionIndex]?.questionType === QuestionType.MCQ
            ? 'Select one option to continue'
            : 'Fill in all the empty blanks to continue'
        }
        onKeyClick={handleKeyClick}
        onBackSpaceClick={handleBackSpaceClick}
        currentQuestion={currentQuestion}
        noKeyboard={isCompleted}
      />
    </>
  );
};

export default Questions;
