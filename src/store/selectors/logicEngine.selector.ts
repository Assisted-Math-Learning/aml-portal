import { createSelector } from 'reselect';
import { LogicEngineState } from 'store/reducers/logicEngine.reducer';
import { AppState } from '../reducers';

const logicEngineState = (state: AppState) => state.logicEngineReducer;

export const islogicEngineLoadingSelector = createSelector(
  [logicEngineState],
  (state: LogicEngineState) => Boolean(state.loading)
);
