import { combineReducers } from 'redux';
import { AuthActionType } from 'store/actions/actions.constants';
import { authReducer } from './auth.reducer';
import { userReducer } from './user.reducer';
import { questionSetReducer } from './questionSet.reducer';
import { learnerJourneyReducer } from './learnerJourney.reducer';
import { navigationReducer } from './NavigationReducer';
import { csrfTokenReducer } from './csrfToken.reducer';
import { contentReducer } from './content.reducer';
import { mediaReducer } from './media.reducer';

const appReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  questionSet: questionSetReducer,
  learnerJourney: learnerJourneyReducer,
  navigationReducer,
  csrfTokenReducer,
  contentReducer,
  mediaReducer,
});

export const rootReducer = (state: any, action: any) => {
  if (action.type === AuthActionType.LOGOUT) {
    // eslint-disable-next-line
    state = {};
  }
  return appReducer(state, action);
};

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
