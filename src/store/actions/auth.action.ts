import { Learner } from 'models/entities/Learner';
import { AuthActionType } from './actions.constants';
import { Tenant } from '../../models/entities/Tenant';

// TODO: MOVE TO SPECIFIC TYPE FILE
export interface AuthLoginActionPayloadType {
  username: string;
  password: string;
}

export const authLoginAction = (payload: AuthLoginActionPayloadType) => ({
  type: AuthActionType.LOGIN,
  payload,
});

export const authLoginCompletedAction = (data: {
  learner: Learner;
  tenant: Tenant;
}) => ({
  type: AuthActionType.LOGIN_COMPLETED,
  payload: data,
});

export const authLoginErrorAction = (message: string) => ({
  type: AuthActionType.LOGIN_ERROR,
  payload: message,
});

export const authFetchMeAction = () => ({ type: AuthActionType.FETCH_ME });

export const authFetchMeCompletedAction = (data: {
  learner: Learner;
  tenant: Tenant;
}) => ({
  type: AuthActionType.FETCH_ME_COMPLETED,
  payload: data,
});

export const authFetchMeErrorAction = (message: string) => ({
  type: AuthActionType.FETCH_ME_ERROR,
  payload: message,
});

export const authLogoutAction = () => ({
  type: AuthActionType.LOGOUT,
});

export const authLogoutCompletedAction = () => ({
  type: AuthActionType.LOGOUT_COMPLETED,
});
