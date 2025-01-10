import { all, call, select, takeLatest } from 'redux-saga/effects';
import { TelemetryDataActionType } from 'store/actions/actions.constants';
import { isSyncInProgressSelector } from '../selectors/telemetryData.selector';
import { indexedDBService } from '../../services/IndexedDBService';
import { IDBStores } from '../../types/enum';
import { telemetryService } from '../../services/api-services/TelemetryService';

function* SyncLearnerTelemetryDataSaga(): any {
  const isSyncing = yield select(isSyncInProgressSelector);

  if (isSyncing) {
    console.log('SKIPPING SYNC, SYNC ALREADY IN PROGRESS');
    return;
  }

  const allLearnerTelemetryData = yield call(
    indexedDBService.getAllObjects,
    IDBStores.TELEMETRY_DATA
  );

  console.log('allLearnerTelemetryData', allLearnerTelemetryData);

  yield call(telemetryService.syncData, allLearnerTelemetryData);
}

function* syncLearnerTelemetryDataSaga() {
  yield all([
    takeLatest(
      TelemetryDataActionType.SYNC_TELEMETRY_DATA,
      SyncLearnerTelemetryDataSaga
    ),
  ]);
}

export default syncLearnerTelemetryDataSaga;
