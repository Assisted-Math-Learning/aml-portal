import { all, call, put, takeLatest } from 'redux-saga/effects';
import { LearnerJourneyActionType } from 'store/actions/actions.constants';
import { StoreAction } from 'models/StoreAction';
import {
  fetchLearnerJourneyCompleted,
  fetchLearnerJourneyFailed,
} from 'store/actions/learnerJourney.actions';
import { learnerJourneyService } from 'services/api-services/learnerJourneyService';
import { questionSetFetchAction } from 'store/actions/questionSet.actions';
import { navigateTo } from 'store/actions/navigation.action';
import { fetchLogicEngineEvaluation } from 'store/actions/logicEngineEvaluation.action';
import { LearnerJourneyStatus } from 'models/enums/learnerJourney.enum';
import { localStorageService } from 'services/LocalStorageService';

function* LearnerJourneyFetchSaga({
  payload,
}: StoreAction<LearnerJourneyActionType>): any {
  try {
    const response = yield call(learnerJourneyService.fetchLearnerjourney, {
      learner_id: payload,
    });
    yield put(fetchLearnerJourneyCompleted(response.result?.data));
    const questionSetId = response?.result?.data?.question_set_id;
    const isInProgress =
      response?.result?.data?.status === LearnerJourneyStatus.IN_PROGRESS;
    const hasLearnerData =
      !!localStorageService.getLearnerResponseData(payload);

    if (response.responseCode === 'OK' && questionSetId && isInProgress) {
      yield put(navigateTo('/continue-journey'));
      yield put(questionSetFetchAction(questionSetId));
    } else if (hasLearnerData) {
      yield put(navigateTo('/continue-journey'));
      if (questionSetId) {
        yield put(questionSetFetchAction(questionSetId));
      } else {
        yield put(fetchLogicEngineEvaluation({ learnerId: payload }));
      }
    } else {
      yield put(navigateTo('/welcome'));
      yield put(fetchLogicEngineEvaluation({ learnerId: payload }));
    }
  } catch (e: any) {
    yield put(
      fetchLearnerJourneyFailed(
        (e?.errors && e.errors[0]?.message) || e?.message
      )
    );
  }
}

function* learnerJourneySaga() {
  yield all([
    takeLatest(
      LearnerJourneyActionType.FETCH_LEARNER_JOURNEY,
      LearnerJourneyFetchSaga
    ),
  ]);
}

export default learnerJourneySaga;
