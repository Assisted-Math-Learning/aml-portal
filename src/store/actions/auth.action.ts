import { User } from 'models/entities/User';
import { SupportedLanguages } from 'types/enum';
import { AuthActionType } from './actions.constants';

// TODO: MOVE TO SPECIFIC TYPE FILE
export interface AuthLoginActionPayloadType {
  username: string;
  password: string;
  language: keyof typeof SupportedLanguages;
}

export const authLoginAction = (payload: AuthLoginActionPayloadType) => ({
  type: AuthActionType.LOGIN,
  payload,
});

export const authLoginCompletedAction = (user: User) => ({
  type: AuthActionType.LOGIN_COMPLETED,
  payload: user,
});

export const authLoginErrorAction = (message: string) => ({
  type: AuthActionType.LOGIN_ERROR,
  payload: message,
});

export const authFetchMeAction = () => ({ type: AuthActionType.FETCH_ME });

export const authFetchMeCompletedAction = (user: User) => ({
  type: AuthActionType.FETCH_ME_COMPLETED,
  payload: user,
});

export const authFetchMeErrorAction = (message: string) => ({
  type: AuthActionType.FETCH_ME_ERROR,
  payload: message,
});

export const authLogoutAction = (
  language: keyof typeof SupportedLanguages = SupportedLanguages.en
) => ({
  type: AuthActionType.LOGOUT,
  payload: {
    language,
  },
});

export const authLogoutCompletedAction = () => ({
  type: AuthActionType.LOGOUT_COMPLETED,
});
