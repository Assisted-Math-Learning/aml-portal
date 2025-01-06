import produce from 'immer';
import { Reducer } from 'redux';
import { TelemetryDataActionType } from 'store/actions/actions.constants';

export interface TelemetryDataState {
  unSyncedData: any[];
}

const initialState: TelemetryDataState = {
  unSyncedData: [],
};

export const telemetryDataReducer: Reducer<TelemetryDataState> = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: TelemetryDataState = initialState,
  action
) =>
  produce(state, (draft: TelemetryDataState) => {
    switch (action.type) {
      case TelemetryDataActionType.PUSH_TELEMETRY_DATA: {
        draft.unSyncedData = [...draft.unSyncedData, action.payload];
        break;
      }
      default: {
        break;
      }
    }
  });
