import produce from 'immer';
import { Reducer } from 'redux';
import { SyncLearnerResponseActionType } from 'store/actions/actions.constants';

export interface SyncResponseState {
  loading?: boolean;
  error?: string;
}

const initialState: SyncResponseState = {
  loading: false,
};

export const syncResponseReducer: Reducer<SyncResponseState> = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: SyncResponseState = initialState,
  action
) =>
  produce(state, (draft: SyncResponseState) => {
    switch (action.type) {
      case SyncLearnerResponseActionType.SYNC_FINAL_LEARNER_RESPONSE: {
        draft.loading = true;
        break;
      }
      case SyncLearnerResponseActionType.SYNC_LEARNER_RESPONSE_COMPLETED: {
        draft.loading = false;
        break;
      }
      case SyncLearnerResponseActionType.SYNC_LEARNER_RESPONSE_ERROR: {
        const error = action.payload as string;
        draft.loading = false;
        draft.error = error;
        break;
      }
      default: {
        break;
      }
    }
  });
