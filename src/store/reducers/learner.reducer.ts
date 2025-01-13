import produce from 'immer';
import { Learner } from 'models/entities/Learner';
import { Reducer } from 'redux';
import { AuthActionType } from 'store/actions/actions.constants';
import { Tenant } from '../../models/entities/Tenant';

export interface LearnerState {
  learner?: Learner;
}

const initialState: LearnerState = {};

export const learnerReducer: Reducer<LearnerState> = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: LearnerState = initialState,
  action
) =>
  produce(state, (draft: LearnerState) => {
    switch (action.type) {
      case AuthActionType.LOGIN_COMPLETED:
      case AuthActionType.FETCH_ME_COMPLETED: {
        const { learner } = action.payload as {
          learner: Learner;
          tenant: Tenant;
        };
        draft.learner = learner;
        break;
      }
      default: {
        break;
      }
    }
  });
