import { TelemetryDataActionType } from './actions.constants';

export const resetTelemetryDataCount = () => ({
  type: TelemetryDataActionType.RESET_DATA_COUNT,
});

export const incrementTelemetryDataCount = () => ({
  type: TelemetryDataActionType.INCREMENT_DATA_COUNT,
});

export const syncTelemetryData = (clearStoreAfterSync = false) => ({
  type: TelemetryDataActionType.SYNC_TELEMETRY_DATA,
  payload: { clearStoreAfterSync },
});
