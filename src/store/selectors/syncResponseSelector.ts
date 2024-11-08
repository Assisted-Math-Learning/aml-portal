import { createSelector } from 'reselect';
import { SyncResponseState } from 'store/reducers/syncResponse.reducer';
import { AppState } from '../reducers';

const syncResponseState = (state: AppState) => state.syncResponseReducer;

export const isSyncInProgressSelector = createSelector(
  [syncResponseState],
  (state: SyncResponseState) => Boolean(state.loading)
);

export const syncResponseErrorSelector = createSelector(
  [syncResponseState],
  (state: SyncResponseState) => state.error
);
