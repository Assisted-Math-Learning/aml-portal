import { all, call, put, takeLatest } from 'redux-saga/effects';
import { SyncLearnerResponseActionType } from 'store/actions/actions.constants';
import { StoreAction } from 'models/StoreAction';
import {
  syncLearnerResponseCompleted,
  syncLearnerResponseError,
} from 'store/actions/syncLearnerResponse.action';
import { syncLearnerResponseService } from 'services/api-services/syncLearnerResponse';
import _ from 'lodash';
import { fetchLogicEngineEvaluation } from 'store/actions/logicEngineEvaluation.action';
import { IDBDataStatus } from '../../types/enum';
import { indexedDBService } from '../../services/IndexedDBService';
import { LearnerJourneyStatus } from '../../models/enums/learnerJourney.enum';
import { authLogoutAction } from '../actions/auth.action';
import { toastService } from '../../services/ToastService';

function* SyncLearnerResponseSaga({
  payload,
}: StoreAction<SyncLearnerResponseActionType>): any {
  const { learnerId, questionSetId, logoutOnSuccess, callLogicEngine } =
    payload;

  const lsKey = `${questionSetId}__${Date.now()}`;

  const dateTime = new Date().toDateString();

  const criteria = {
    status: IDBDataStatus.NOOP,
    learner_id: learnerId,
    question_set_id: questionSetId,
  };
  const learnerResponseData = yield call(
    indexedDBService.queryObjectsByKeys,
    criteria
  );

  if (!learnerResponseData.length) {
    console.log('No data for sync');
    localStorage.setItem(lsKey, 'NO DATA FOR SYNC');
    yield put(syncLearnerResponseCompleted());
    if (logoutOnSuccess) {
      yield put(authLogoutAction());
    }
    return;
  }

  if (logoutOnSuccess) {
    toastService.showInfo('Saving progress');
  }

  const objIds = learnerResponseData.map((data: any) => data.id) as number[];
  try {
    const learnerResponseDataQIDs = learnerResponseData.map(
      (data: any) => data.question_id
    ) as string[];

    localStorage.setItem(
      lsKey,
      JSON.stringify({ payload: learnerResponseData, dateTime })
    );

    yield call(
      indexedDBService.updateStatusByIds,
      objIds,
      IDBDataStatus.SYNCING
    );

    const response = yield call(
      syncLearnerResponseService.syncLearnerResponse,
      {
        learner_id: learnerId,
        questions_data: learnerResponseData,
      }
    );

    if (callLogicEngine && learnerId) {
      yield put(fetchLogicEngineEvaluation({ learnerId }));
    }

    if (response?.responseCode === 'OK') {
      const learnerJourney = response?.result?.data;
      const {
        status,
        question_set_id: completedQuestionSetId,
        completed_question_ids: completedQuestionIds,
      } = learnerJourney;

      const syncedIdentifiers = _.intersection(
        learnerResponseDataQIDs,
        completedQuestionIds
      );
      const syncedIds = learnerResponseData
        .filter((data: any) => syncedIdentifiers.includes(data.question_id))
        .map((data: any) => data.id);
      // updating status of data entries
      yield call(
        indexedDBService.updateStatusByIds,
        syncedIds,
        IDBDataStatus.SYNCED
      );

      if (syncedIds.length !== objIds.length) {
        const unsyncedIds = _.difference(objIds, syncedIds);
        yield call(
          indexedDBService.updateStatusByIds,
          unsyncedIds,
          IDBDataStatus.NOOP
        );
      }

      if (status === LearnerJourneyStatus.COMPLETED) {
        /**
         * Delete all entries of completed QS for loggedInUser
         */
        const hasLocalDataForOldQS = yield call(
          indexedDBService.queryObjectsByKeys,
          {
            learner_id: learnerId,
            question_set_id: completedQuestionSetId,
            status: IDBDataStatus.SYNCED,
          }
        );

        if (
          hasLocalDataForOldQS.length &&
          hasLocalDataForOldQS.length === completedQuestionIds.length
        ) {
          const ids = hasLocalDataForOldQS.map(
            (data: any) => data.id
          ) as number[];
          yield call(indexedDBService.deleteObjectsByIds, ids);
        }
      }

      yield put(syncLearnerResponseCompleted());
      if (logoutOnSuccess) {
        toastService.showInfo('Progress saved successfully.');
        yield put(authLogoutAction());
      }
    }
  } catch (e: any) {
    localStorage.setItem(
      lsKey,
      JSON.stringify({ payload: learnerResponseData, dateTime, error: e })
    );
    yield call(indexedDBService.updateStatusByIds, objIds, IDBDataStatus.NOOP);
    if (logoutOnSuccess) {
      toastService.showError('Progress could not be saved');
    }
    yield put(
      syncLearnerResponseError(
        (e?.errors && e.errors[0]?.message) || e?.message
      )
    );
  }
}

function* SyncFinalLearnerResponseSaga({
  payload,
}: StoreAction<SyncLearnerResponseActionType>): any {
  const { learnerId, questionSetId, logoutOnSuccess, callLogicEngine } =
    payload;

  const lsKey = `${questionSetId}__${Date.now()}`;

  const dateTime = new Date().toDateString();

  const criteria = {
    status: IDBDataStatus.NOOP,
    learner_id: learnerId,
    question_set_id: questionSetId,
  };
  const learnerResponseData = yield call(
    indexedDBService.queryObjectsByKeys,
    criteria
  );

  if (!learnerResponseData.length) {
    console.log('No data for sync');
    localStorage.setItem(lsKey, 'NO DATA FOR SYNC');
    yield put(syncLearnerResponseCompleted());
    if (logoutOnSuccess) {
      yield put(authLogoutAction());
    }
    return;
  }

  if (logoutOnSuccess) {
    toastService.showInfo('Saving progress');
  }

  const objIds = learnerResponseData.map((data: any) => data.id) as number[];
  try {
    const learnerResponseDataQIDs = learnerResponseData.map(
      (data: any) => data.question_id
    ) as string[];

    localStorage.setItem(
      lsKey,
      JSON.stringify({ payload: learnerResponseData, dateTime })
    );

    yield call(
      indexedDBService.updateStatusByIds,
      objIds,
      IDBDataStatus.SYNCING
    );

    const response = yield call(
      syncLearnerResponseService.syncLearnerResponse,
      {
        learner_id: learnerId,
        questions_data: learnerResponseData,
      }
    );

    if (callLogicEngine && learnerId) {
      yield put(fetchLogicEngineEvaluation({ learnerId }));
    }

    if (response?.responseCode === 'OK') {
      const learnerJourney = response?.result?.data;
      const {
        status,
        question_set_id: completedQuestionSetId,
        completed_question_ids: completedQuestionIds,
      } = learnerJourney;

      const syncedIdentifiers = _.intersection(
        learnerResponseDataQIDs,
        completedQuestionIds
      );
      const syncedIds = learnerResponseData
        .filter((data: any) => syncedIdentifiers.includes(data.question_id))
        .map((data: any) => data.id);
      // updating status of data entries
      yield call(
        indexedDBService.updateStatusByIds,
        syncedIds,
        IDBDataStatus.SYNCED
      );

      if (syncedIds.length !== objIds.length) {
        const unsyncedIds = _.difference(objIds, syncedIds);
        yield call(
          indexedDBService.updateStatusByIds,
          unsyncedIds,
          IDBDataStatus.NOOP
        );
      }

      if (status === LearnerJourneyStatus.COMPLETED) {
        /**
         * Delete all entries of completed QS for loggedInUser
         */
        const hasLocalDataForOldQS = yield call(
          indexedDBService.queryObjectsByKeys,
          {
            learner_id: learnerId,
            question_set_id: completedQuestionSetId,
            status: IDBDataStatus.SYNCED,
          }
        );

        if (
          hasLocalDataForOldQS.length &&
          hasLocalDataForOldQS.length === completedQuestionIds.length
        ) {
          const ids = hasLocalDataForOldQS.map(
            (data: any) => data.id
          ) as number[];
          yield call(indexedDBService.deleteObjectsByIds, ids);
        }
      }

      yield put(syncLearnerResponseCompleted());
      if (logoutOnSuccess) {
        toastService.showInfo('Progress saved successfully.');
        yield put(authLogoutAction());
      }
    }
  } catch (e: any) {
    localStorage.setItem(
      lsKey,
      JSON.stringify({ payload: learnerResponseData, dateTime, error: e })
    );
    yield call(indexedDBService.updateStatusByIds, objIds, IDBDataStatus.NOOP);
    if (logoutOnSuccess) {
      toastService.showError('Progress could not be saved');
    }
    yield put(
      syncLearnerResponseError(
        (e?.errors && e.errors[0]?.message) || e?.message
      )
    );
  }
}

function* syncLearnerResponseSaga() {
  yield all([
    takeLatest(
      SyncLearnerResponseActionType.SYNC_LEARNER_RESPONSE,
      SyncLearnerResponseSaga
    ),
    takeLatest(
      SyncLearnerResponseActionType.SYNC_FINAL_LEARNER_RESPONSE,
      SyncFinalLearnerResponseSaga
    ),
  ]);
}

export default syncLearnerResponseSaga;
