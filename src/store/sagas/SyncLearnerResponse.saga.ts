import { all, call, put, takeLatest, select } from 'redux-saga/effects';
import { SyncLearnerResponseActionType } from 'store/actions/actions.constants';
import { StoreAction } from 'models/StoreAction';
import {
  syncLearnerResponseCompleted,
  syncLearnerResponseError,
} from 'store/actions/syncLearnerResponse.action';
import { syncLearnerResponseService } from 'services/api-services/syncLearnerResponse';
import _ from 'lodash';
import { fetchLogicEngineEvaluation } from 'store/actions/logicEngineEvaluation.action';
import { getTranslatedString } from 'shared-resources/components/MultiLangText/MultiLangText';
import { multiLangLabels } from 'utils/constants/multiLangLabels.constants';
import {
  CONTENT_LANG,
  localStorageService,
} from 'services/LocalStorageService';
import { IDBDataStatus, SupportedLanguages } from '../../types/enum';
import { indexedDBService } from '../../services/IndexedDBService';
import { LearnerJourneyStatus } from '../../models/enums/learnerJourney.enum';
import { authLogoutAction } from '../actions/auth.action';
import { toastService } from '../../services/ToastService';
import { questionsSetSelector } from '../selectors/questionSet.selector';
import { learnerIdSelector } from '../selectors/auth.selector';
import {
  isIntermediateSyncInProgressSelector,
  isSyncInProgressSelector,
} from '../selectors/syncResponseSelector';

function* SyncLearnerResponseSaga({
  payload,
}: StoreAction<SyncLearnerResponseActionType>): any {
  const learnerId = yield select(learnerIdSelector);
  const questionSet = yield select(questionsSetSelector);
  const isSyncing = yield select(isSyncInProgressSelector);
  const questionSetId = questionSet?.identifier;

  if (isSyncing) {
    console.log('SKIPPING SYNC, SYNC ALREADY IN PROGRESS');
    return;
  }

  if (!learnerId || !questionSetId) {
    console.log('SKIPPING SYNC, LEARNER ID OR QUESTION SET MISSING');
    return;
  }
  localStorage.setItem(
    `${questionSetId}_${Date.now()}`,
    'STARTING INTERMEDIATE SYNC'
  );
  console.log(
    `${questionSetId}_${Date.now()} STARTING INTERMEDIATE SYNC ${new Date().toString()}`
  );
  const { logoutOnSuccess } = payload;

  const lsKey = `${questionSetId}__${Date.now()}`;

  const dateTime = new Date().toString();

  const criteria = {
    learner_id: learnerId,
    question_set_id: questionSetId,
  };
  const allLearnerResponseData = yield call(
    indexedDBService.queryObjectsByKeys,
    criteria
  );

  const learnerResponseData = allLearnerResponseData.filter((data: any) =>
    [IDBDataStatus.NOOP, IDBDataStatus.REVISITED].includes(data.status)
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

  const language =
    (localStorageService.getLocalStorageValue(
      CONTENT_LANG
    ) as keyof typeof SupportedLanguages) ?? SupportedLanguages.en;

  if (logoutOnSuccess) {
    toastService.showInfo(
      getTranslatedString(language, multiLangLabels.saving_progress)
    );
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
        all_data: allLearnerResponseData,
      }
    );

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
        toastService.showInfo(
          getTranslatedString(
            language,
            multiLangLabels.progress_saved_successfully
          )
        );
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
      toastService.showError(
        getTranslatedString(language, multiLangLabels.progress_could_not_saved)
      );
    }
    yield put(
      syncLearnerResponseError(
        (e?.errors && e.errors[0]?.message) || e?.message
      )
    );
  }
}

function* SyncFinalLearnerResponseSaga(): any {
  const learnerId = yield select(learnerIdSelector);
  const questionSet = yield select(questionsSetSelector);
  const isIntermediateSyncing = yield select(
    isIntermediateSyncInProgressSelector
  );
  const questionSetId = questionSet?.identifier;

  if (isIntermediateSyncing) {
    console.log('SKIPPING SYNC, SYNC ALREADY IN PROGRESS');
    return;
  }

  if (!learnerId || !questionSetId) {
    console.log('SKIPPING SYNC, LEARNER ID OR QUESTION SET MISSING');
    return;
  }
  localStorage.setItem(`${questionSetId}_${Date.now()}`, 'STARTING FINAL SYNC');
  console.log(
    `${questionSetId}_${Date.now()} STARTING FINAL SYNC ${new Date().toString()}`
  );

  const lsKey = `${questionSetId}__${Date.now()}`;

  const dateTime = new Date().toString();

  const criteria = {
    learner_id: learnerId,
    question_set_id: questionSetId,
  };
  const allLearnerResponseData = yield call(
    indexedDBService.queryObjectsByKeys,
    criteria
  );

  const learnerResponseData = allLearnerResponseData.filter((data: any) =>
    [IDBDataStatus.NOOP, IDBDataStatus.REVISITED].includes(data.status)
  );

  if (!learnerResponseData.length) {
    console.log('No data for sync');
    localStorage.setItem(lsKey, 'NO DATA FOR SYNC');
    yield put(syncLearnerResponseCompleted());
    return;
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
        all_data: allLearnerResponseData,
      }
    );

    if (learnerId) {
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
    }
  } catch (e: any) {
    localStorage.setItem(
      lsKey,
      JSON.stringify({ payload: learnerResponseData, dateTime, error: e })
    );
    yield call(indexedDBService.updateStatusByIds, objIds, IDBDataStatus.NOOP);
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
