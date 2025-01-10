import { createSelector } from 'reselect';
import { AppState } from '../reducers';
import { AuthState } from '../reducers/auth.reducer';

const authState = (state: AppState) => state.auth;

export const isAuthenticatedSelector = createSelector(
  [authState],
  (state: AuthState) => Boolean(state.learnerId)
);

export const isAuthLoadingSelector = createSelector(
  [authState],
  (state: AuthState) => Boolean(state.loading)
);

export const isLoggingOutSelector = createSelector(
  [authState],
  (state: AuthState) => Boolean(state.isLoggingOut)
);

export const authErrorSelector = createSelector(
  [authState],
  (state: AuthState) => state.error
);

export const loggedInUserSelector = createSelector(
  [authState],
  (state: AuthState) => state.learner
);

export const learnerIdSelector = createSelector(
  [authState],
  (state: AuthState) => state.learnerId
);

export const enableTelemetrySelector = createSelector(
  [authState],
  (state: AuthState) => state.tenant?.enable_telemetry
);
