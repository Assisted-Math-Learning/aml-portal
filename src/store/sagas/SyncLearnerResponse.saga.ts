import { all, call, put, takeLatest } from 'redux-saga/effects';
import { SyncLearnerResponseActionType } from 'store/actions/actions.constants';
import { StoreAction } from 'models/StoreAction';
import {
  syncLearnerResponseCompleted,
  syncLearnerResponseError,
} from 'store/actions/syncLearnerResponse.action';
import { syncLearnerResponseService } from 'services/api-services/syncLearnerResponse';
import { localStorageService } from 'services/LocalStorageService';

function* SyncLearnerResponseSaga({
  payload,
}: StoreAction<SyncLearnerResponseActionType>): any {
  try {
    const response = yield call(
      syncLearnerResponseService.syncLearnerResponse,
      payload
    );
    yield put(syncLearnerResponseCompleted(response.result?.data?.message));
    if (response?.responseCode === 'OK') {
      // clearing local storage now as data sync completed
      localStorageService.deleteLearnerResponseData(payload.learner_id);
    }
  } catch (e: any) {
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
      SyncLearnerResponseSaga
    ),
  ]);
}

export default syncLearnerResponseSaga;
