import { createSelector } from 'reselect';
import { AppState } from '../reducers';
import { TelemetryDataState } from '../reducers/telemetryData.reducer';

const telemetryDataState = (state: AppState) => state.telemetryDataReducer;

export const isSyncInProgressSelector = createSelector(
  [telemetryDataState],
  (state: TelemetryDataState) => Boolean(state.loading)
);

export const telemetryDataCountSelector = createSelector(
  [telemetryDataState],
  (state: TelemetryDataState) => state.dataCount
);
