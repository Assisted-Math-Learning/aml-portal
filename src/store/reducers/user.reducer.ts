import produce from 'immer';
import { User } from 'models/entities/Learner';
import { Reducer } from 'redux';
import { AuthActionType } from 'store/actions/actions.constants';

export interface UserState {
  user?: User;
}

const initialState: UserState = {};

export const userReducer: Reducer<UserState> = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: UserState = initialState,
  action
) =>
  produce(state, (draft: UserState) => {
    switch (action.type) {
      case AuthActionType.LOGIN_COMPLETED:
      case AuthActionType.FETCH_ME_COMPLETED: {
        const user = action.payload as User;
        draft.user = user;
        break;
      }
      default: {
        break;
      }
    }
  });
