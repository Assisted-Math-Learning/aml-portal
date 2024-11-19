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
import _ from 'lodash';
import { indexedDBService } from '../../services/IndexedDBService';

function* LogicEngineEvaluationFetchSaga({
  payload,
}: StoreAction<LogicEngineActionType>): any {
  try {
    const { learnerId, goToInstructions } = payload;
    const response = yield call(
      logicEngineEvalutionService.fetchLogicEngineEvaluation,
      {
        learner_id: learnerId,
      }
    );
    yield put(fetchLogicEngineEvaluationCompleted());
    if (response?.result?.data?.question_set_id) {
      const newQSID = response?.result?.data?.question_set_id;

      const allLocalData = yield call(
        indexedDBService.queryObjectsByKey,
        'learner_id',
        learnerId
      );

      const localDataForNewQSID = (allLocalData || []).filter(
        (data: any) => data.question_set_id === newQSID
      );

      /**
       * Clearing redundant data
       */
      if (localDataForNewQSID.length < allLocalData.length) {
        const localDataIdsForOldQS = _.difference(
          allLocalData,
          localDataForNewQSID
        ).map((data: any) => data.id);
        yield call(indexedDBService.deleteObjectsByIds, localDataIdsForOldQS);
      }

      if (localDataForNewQSID.length) {
        yield put(navigateTo('/continue-journey'));
      } else if (goToInstructions) {
        yield put(navigateTo('/instructions'));
      }
      yield put(questionSetFetchAction(newQSID));
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
