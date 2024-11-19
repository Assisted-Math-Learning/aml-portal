import produce from 'immer';
import { Reducer } from 'redux';
import { LogicEngineActionType } from 'store/actions/actions.constants';

export interface LogicEngineState {
  loading?: boolean;
  error?: string;
}

const initialState: LogicEngineState = {
  loading: false,
};
export const logicEngineReducer: Reducer<LogicEngineState> = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: LogicEngineState = initialState,
  action
) =>
  produce(state, (draft: LogicEngineState) => {
    switch (action.type) {
      case LogicEngineActionType.FETCH_LOGIC_ENGINE_EVALUATION: {
        draft.loading = true;
        break;
      }
      case LogicEngineActionType.FETCH_LOGIC_ENGINE_EVALUATION_COMPLETED: {
        draft.loading = false;
        break;
      }
      case LogicEngineActionType.FETCH_LOGIC_ENGINE_EVALUATION_ERROR: {
        const error = action.payload as string;
        draft.loading = false;
        draft.error = error;
        break;
      }
      default: {
        break;
      }
    }
  });
