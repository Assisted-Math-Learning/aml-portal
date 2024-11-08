import { all, call, put, takeLatest } from 'redux-saga/effects';
import { LogicEngineActionType } from 'store/actions/actions.constants';
import { StoreAction } from 'models/StoreAction';

import { questionSetFetchAction } from 'store/actions/questionSet.actions';
import { navigateTo } from 'store/actions/navigation.action';
import {
  fetchLogicEngineEvaluationCompleted,
  fetchLogicEngineEvaluationError,
} from 'store/actions/logicEngineEvaluation.action';
import { logicEngineEvalutionService } from 'services/api-services/logicEngineEvaluationService';
import { localStorageService } from 'services/LocalStorageService';

function* LogicEngineEvaluationFetchSaga({
  payload,
}: StoreAction<LogicEngineActionType>): any {
  try {
    const response = yield call(
      logicEngineEvalutionService.fetchLogicEngineEvaluation,
      {
        learner_id: payload.learnerId,
      }
    );
    // not needed
    // yield put(fetchLogicEngineEvaluationCompleted(response.result?.data));
    if (response?.result?.data?.question_set_id) {
      const hasLocalData = localStorageService.getLearnerResponseData(
        String(payload.learnerId)
      );
      if (hasLocalData) {
        yield put(navigateTo('/continue-journey'));
      } else if (payload?.goToInstructions) {
        yield put(navigateTo('/instructions'));
      } else {
        yield put(navigateTo('/welcome'));
      }
      yield put(questionSetFetchAction(response.result.data.question_set_id));
    } else {
      yield put(navigateTo('/completed'));
    }
  } catch (e: any) {
    yield put(
      fetchLogicEngineEvaluationError(
        (e?.errors && e.errors[0]?.message) || e?.message
      )
    );
  }
}

function* logicEngineEvaluationSaga() {
  yield all([
    takeLatest(
      LogicEngineActionType.FETCH_LOGIC_ENGINE_EVALUATION,
      LogicEngineEvaluationFetchSaga
    ),
  ]);
}

export default logicEngineEvaluationSaga;
