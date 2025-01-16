import produce from 'immer';
import { Reducer } from 'redux';
import { TelemetryDataActionType } from 'store/actions/actions.constants';

export interface TelemetryDataState {
  loading: boolean;
  error?: string;
  dataCount: number;
}

const initialState: TelemetryDataState = {
  loading: false,
  dataCount: 0,
};

export const telemetryDataReducer: Reducer<TelemetryDataState> = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: TelemetryDataState = initialState,
  action
) =>
  produce(state, (draft: TelemetryDataState) => {
    switch (action.type) {
      case TelemetryDataActionType.RESET_DATA_COUNT: {
        draft.dataCount = 0;
        break;
      }
      case TelemetryDataActionType.INCREMENT_DATA_COUNT: {
        draft.dataCount += 1;
        break;
      }
      case TelemetryDataActionType.SYNC_TELEMETRY_DATA: {
        // draft.loading = true;
        break;
      }
      case TelemetryDataActionType.SYNC_TELEMETRY_DATA_COMPLETE: {
        draft.loading = false;
        break;
      }
      case TelemetryDataActionType.SYNC_TELEMETRY_DATA_ERROR: {
        draft.loading = false;
        draft.error = action.payload;
        break;
      }
      default: {
        break;
      }
    }
  });
