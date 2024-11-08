import { SyncLearnerResponseActionType } from './actions.constants';

export const syncLearnerResponse = (data: any) => ({
  type: SyncLearnerResponseActionType.SYNC_LEARNER_RESPONSE,
  payload: data,
});

export const syncFinalLearnerResponse = (data: any) => ({
  type: SyncLearnerResponseActionType.SYNC_FINAL_LEARNER_RESPONSE,
  payload: data,
});

export const syncLearnerResponseCompleted = (message: string) => ({
  type: SyncLearnerResponseActionType.SYNC_LEARNER_RESPONSE_COMPLETED,
  payload: message,
});

export const syncLearnerResponseError = (error: string) => ({
  type: SyncLearnerResponseActionType.SYNC_LEARNER_RESPONSE_ERROR,
  payload: error,
});
