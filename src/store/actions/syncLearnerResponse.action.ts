import { SupportedLanguages } from 'types/enum';
import { SyncLearnerResponseActionType } from './actions.constants';

export const syncLearnerResponse = (
  logoutOnSuccess = false,
  language: keyof typeof SupportedLanguages = SupportedLanguages.en
) => ({
  type: SyncLearnerResponseActionType.SYNC_LEARNER_RESPONSE,
  payload: { logoutOnSuccess, language },
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
