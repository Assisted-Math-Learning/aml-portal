import { SyncLearnerResponseActionType } from './actions.constants';

export const syncLearnerResponse = (logoutOnSuccess = false) => ({
  type: SyncLearnerResponseActionType.SYNC_LEARNER_RESPONSE,
  payload: { logoutOnSuccess },
});

export const syncFinalLearnerResponse = () => ({
  type: SyncLearnerResponseActionType.SYNC_FINAL_LEARNER_RESPONSE,
});

export const syncLearnerResponseCompleted = () => ({
  type: SyncLearnerResponseActionType.SYNC_LEARNER_RESPONSE_COMPLETED,
});

export const syncLearnerResponseError = (error: string) => ({
  type: SyncLearnerResponseActionType.SYNC_LEARNER_RESPONSE_ERROR,
  payload: error,
});
