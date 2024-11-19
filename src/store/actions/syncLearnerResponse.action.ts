import { SyncLearnerResponseActionType } from './actions.constants';

export const syncLearnerResponse = (
  learnerId: string,
  questionSetId: string,
  logoutOnSuccess = false
) => ({
  type: SyncLearnerResponseActionType.SYNC_LEARNER_RESPONSE,
  payload: { learnerId, questionSetId, logoutOnSuccess },
});

export const syncFinalLearnerResponse = (
  learnerId: string,
  questionSetId: string
) => ({
  type: SyncLearnerResponseActionType.SYNC_FINAL_LEARNER_RESPONSE,
  payload: { learnerId, questionSetId, callLogicEngine: true },
});

export const syncLearnerResponseCompleted = () => ({
  type: SyncLearnerResponseActionType.SYNC_LEARNER_RESPONSE_COMPLETED,
});

export const syncLearnerResponseError = (error: string) => ({
  type: SyncLearnerResponseActionType.SYNC_LEARNER_RESPONSE_ERROR,
  payload: error,
});
