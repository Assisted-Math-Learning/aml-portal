import { all, call, takeLatest } from 'redux-saga/effects';
import { TelemetryDataActionType } from 'store/actions/actions.constants';
import { indexedDBService } from '../../services/IndexedDBService';
import { IDBDataStatus, IDBStores } from '../../types/enum';
import { telemetryService } from '../../services/api-services/TelemetryApiService';
import { StoreAction } from '../../models/StoreAction';

function* SyncLearnerTelemetryDataSaga({
  payload,
}: StoreAction<TelemetryDataActionType>): any {
  const { clearStoreAfterSync } = payload;

  const allLearnerTelemetryData = yield call(
    indexedDBService.queryObjectsByKey,
    'status',
    IDBDataStatus.NOOP,
    IDBStores.TELEMETRY_DATA
  );

  const itemIds = allLearnerTelemetryData.map((data: any) => data.id);

  if (!itemIds.length) {
    if (clearStoreAfterSync) {
      yield call(indexedDBService.clearStore, IDBStores.TELEMETRY_DATA);
    }
    return;
  }

  yield call(
    indexedDBService.updateStatusByIds,
    itemIds,
    IDBDataStatus.SYNCING,
    IDBStores.TELEMETRY_DATA
  );

  const dataForPayload = allLearnerTelemetryData.map((data: any) => {
    delete data.id;
    delete data.status;
    return data;
  });

  const response = yield call(telemetryService.syncData, dataForPayload);

  if (response && response.responseCode === 'SUCCESS') {
    yield call(
      indexedDBService.updateStatusByIds,
      itemIds,
      IDBDataStatus.SYNCED,
      IDBStores.TELEMETRY_DATA
    );

    if (clearStoreAfterSync) {
      yield call(indexedDBService.clearStore, IDBStores.TELEMETRY_DATA);
    }
  }
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
