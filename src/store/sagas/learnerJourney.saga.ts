import { all, call, put, takeLatest } from 'redux-saga/effects';
import { LearnerJourneyActionType } from 'store/actions/actions.constants';
import { StoreAction } from 'models/StoreAction';
import {
  fetchLearnerJourneyCompleted,
  fetchLearnerJourneyFailed,
} from 'store/actions/learnerJourney.actions';
import { learnerJourneyService } from 'services/api-services/learnerJourneyService';
import { questionSetFetchAction } from 'store/actions/questionSet.actions';
import { navigateTo } from 'store/actions/navigation.action';
import { fetchLogicEngineEvaluation } from 'store/actions/logicEngineEvaluation.action';
import { LearnerJourneyStatus } from 'models/enums/learnerJourney.enum';
import { IDBDataStatus } from '../../types/enum';
import { indexedDBService } from '../../services/IndexedDBService';

function* LearnerJourneyFetchSaga({
  payload,
}: StoreAction<LearnerJourneyActionType>): any {
  try {
    const response = yield call(learnerJourneyService.fetchLearnerjourney, {
      learner_id: payload,
    });

    let latestResponses = {
      result: {
        data: [],
      },
    };
    try {
      latestResponses = yield call(
        learnerJourneyService.fetchLearnerJourneyLatestResponses,
        {
          learnerId: payload,
        }
      );
    } catch {
      latestResponses = {
        result: {
          data: [],
        },
      };
    }

    yield put(fetchLearnerJourneyCompleted(response.result?.data));
    const questionSetId = response?.result?.data?.question_set_id;
    const isInProgress =
      response?.result?.data?.status === LearnerJourneyStatus.IN_PROGRESS;
    const criteria = {
      status: IDBDataStatus.NOOP,
      learner_id: payload,
    };
    const learnerResponseData = yield call(
      indexedDBService.queryObjectsByKeys,
      criteria
    );
    const hasLearnerData = learnerResponseData.length > 0;

    /**
     * Reverse Syncing
     */
    const completedQuestionIds =
      response?.result?.data?.completed_question_ids || [];
    const localDBDataForCurrentQSID = yield call(
      indexedDBService.queryObjectsByKeys,
      {
        learner_id: payload,
        question_set_id: questionSetId,
      }
    );
    // DATA SYNCED AT BE, BUT NOT UPDATED IN FE
    const idbUnsyncedDataIds = (localDBDataForCurrentQSID || [])
      .filter(
        (data: any) =>
          [IDBDataStatus.SYNCING, IDBDataStatus.NOOP].includes(data?.status) &&
          completedQuestionIds.includes(data.question_id)
      )
      .map((data: any) => data.id);
    if (idbUnsyncedDataIds.length > 0) {
      yield call(
        indexedDBService.updateStatusByIds,
        idbUnsyncedDataIds,
        IDBDataStatus.SYNCED
      );
    }
    // DATA MARKED AS SYNCING ON FE, BUT NEVER SYNCED ON BE
    const idbDataStuckInSyncingStage = (localDBDataForCurrentQSID || [])
      .filter(
        (data: any) =>
          [IDBDataStatus.SYNCING].includes(data?.status) &&
          !completedQuestionIds.includes(data.question_id)
      )
      .map((data: any) => data.id);
    if (idbDataStuckInSyncingStage.length > 0) {
      yield call(
        indexedDBService.updateStatusByIds,
        idbDataStuckInSyncingStage,
        IDBDataStatus.NOOP
      );
    }

    // update/add learner responses for SYNCED questions
    latestResponses?.result?.data?.forEach(
      async (
        resp: Awaited<
          ReturnType<
            typeof learnerJourneyService.fetchLearnerJourneyLatestResponses
          >
        >[number]
      ) => {
        const entryData = {
          question_id: resp.question_id,
          question_set_id: resp.question_set_id,
          learner_id: payload,
        };
        const entryExists = (await indexedDBService.queryObjectsByKeys(
          entryData
        )) as any[];
        if (entryExists && entryExists.length) {
          if (entryExists[0].status !== IDBDataStatus.SYNCED) return;

          await indexedDBService.updateObjectById(entryExists[0].id, {
            ...entryData,
            learner_response: resp.learner_response,
            status: IDBDataStatus.SYNCED,
          });
        } else {
          await indexedDBService.addObject({
            ...entryData,
            learner_response: resp.learner_response,
            status: IDBDataStatus.SYNCED,
          });
        }
      }
    );

    if (response.responseCode === 'OK' && questionSetId && isInProgress) {
      yield put(navigateTo('/continue-journey'));
      yield put(questionSetFetchAction(questionSetId));
    } else if (hasLearnerData) {
      yield put(navigateTo('/continue-journey'));
      if (questionSetId && isInProgress) {
        yield put(questionSetFetchAction(questionSetId));
      } else {
        yield put(fetchLogicEngineEvaluation({ learnerId: payload }));
      }
    } else {
      yield put(navigateTo('/welcome'));
      yield put(fetchLogicEngineEvaluation({ learnerId: payload }));
    }
  } catch (e: any) {
    yield put(
      fetchLearnerJourneyFailed(
        (e?.errors && e.errors[0]?.message) || e?.message
      )
    );
  }
}

function* learnerJourneySaga() {
  yield all([
    takeLatest(
      LearnerJourneyActionType.FETCH_LEARNER_JOURNEY,
      LearnerJourneyFetchSaga
    ),
  ]);
}

export default learnerJourneySaga;
