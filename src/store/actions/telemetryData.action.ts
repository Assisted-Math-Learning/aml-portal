import { TelemetryDataActionType } from './actions.constants';

export const syncTelemetryData = () => ({
  type: TelemetryDataActionType.SYNC_TELEMETRY_DATA,
});
