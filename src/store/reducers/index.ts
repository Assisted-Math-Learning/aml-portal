import { combineReducers } from 'redux';
import { AuthActionType } from 'store/actions/actions.constants';
import { authReducer } from './auth.reducer';
import { learnerReducer } from './learner.reducer';
import { questionSetReducer } from './questionSet.reducer';
import { learnerJourneyReducer } from './learnerJourney.reducer';
import { navigationReducer } from './NavigationReducer';
import { csrfTokenReducer } from './csrfToken.reducer';
import { syncResponseReducer } from './syncResponse.reducer';
import { logicEngineReducer } from './logicEngine.reducer';
import { boardReducer } from './board.reducer';
import { telemetryDataReducer } from './telemetryData.reducer';
import { arrangeObjectKeysInAlphabeticOrder } from '../../shared-resources/utils/helpers';

const appReducer = combineReducers(
  arrangeObjectKeysInAlphabeticOrder({
    auth: authReducer,
    learner: learnerReducer,
    questionSet: questionSetReducer,
    learnerJourney: learnerJourneyReducer,
    navigationReducer,
    csrfTokenReducer,
    syncResponseReducer,
    logicEngineReducer,
    boardReducer,
    telemetryDataReducer,
  })
);

export const rootReducer = (state: any, action: any) => {
  if (action.type === AuthActionType.LOGOUT) {
    // eslint-disable-next-line
    state = {};
  }
  return appReducer(state, action);
};

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
