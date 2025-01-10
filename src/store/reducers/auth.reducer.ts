import produce from 'immer';
import { Reducer } from 'redux';
import { AuthActionType } from 'store/actions/actions.constants';
import { Learner } from '../../models/entities/Learner';
import { Tenant } from '../../models/entities/Tenant';

export interface AuthState {
  learnerId?: string;
  loading?: boolean;
  error?: string;
  learner?: Learner;
  tenant?: Tenant;
  isLoggingOut: boolean;
}

const initialState: AuthState = {
  isLoggingOut: false,
};

export const authReducer: Reducer<AuthState> = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: AuthState = initialState,
  action: any
) =>
  produce(state, (draft: AuthState) => {
    switch (action.type) {
      case AuthActionType.LOGIN:
      case AuthActionType.FETCH_ME: {
        draft.loading = true;
        break;
      }
      case AuthActionType.LOGIN_COMPLETED:
      case AuthActionType.FETCH_ME_COMPLETED: {
        const { learner, tenant } = action.payload as {
          learner: Learner;
          tenant: Tenant;
        };
        draft.learnerId = learner.identifier;
        draft.learner = learner;
        draft.tenant = tenant;
        draft.loading = false;
        draft.error = undefined;
        break;
      }
      case AuthActionType.LOGIN_ERROR:
      case AuthActionType.FETCH_ME_ERROR: {
        draft.loading = false;
        draft.error = action.payload;
        break;
      }
      case AuthActionType.LOGOUT: {
        draft.isLoggingOut = true;
        break;
      }
      case AuthActionType.LOGOUT_COMPLETED: {
        draft.isLoggingOut = false;
        break;
      }
      default:
        break;
    }
  });
