import { SagaPayloadType } from 'types/SagaPayload.type';
import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import {
  AuthActionType,
  CSRFTokenActionType,
} from 'store/actions/actions.constants';
import {
  authFetchMeCompletedAction,
  authFetchMeErrorAction,
  AuthLoginActionPayloadType,
  authLoginCompletedAction,
  authLoginErrorAction,
  authLogoutCompletedAction,
} from 'store/actions/auth.action';
import { authService } from 'services/api-services/AuthService';
import {
  CONTENT_LANG,
  localStorageService,
} from 'services/LocalStorageService';
import { fetchLearnerJourney } from 'store/actions/learnerJourney.actions';
import { navigateTo } from 'store/actions/navigation.action';
import {
  fetchCSRFTokenCompleted,
  fetchCSRFTokenFailed,
} from 'store/actions/csrfToken.action';
import { toastService } from 'services/ToastService';
import { getTranslatedString } from 'shared-resources/components/MultiLangText/MultiLangText';
import { multiLangLabels } from 'utils/constants/multiLangLabels.constants';
import { SupportedLanguages } from 'types/enum';
import { fetchBoard } from 'store/actions/board.action';
import { Learner } from '../../models/entities/Learner';
import { Tenant } from '../../models/entities/Tenant';
import telemetryService from '../../services/TelemetryService';
import { TelemetryDataEventType } from '../../models/enums/telemetryDataEventType.enum';
import { learnerIdSelector } from '../selectors/auth.selector';
import { syncTelemetryData } from '../actions/telemetryData.action';

interface LoginSagaPayloadType extends SagaPayloadType {
  payload: AuthLoginActionPayloadType;
}
function* loginSaga(data: LoginSagaPayloadType): any {
  try {
    const response: {
      responseCode: any;
      result: { data: { learner: Learner; tenant: Tenant } };
    } = yield call(authService.login, data.payload);
    if (response.responseCode === 'OK' && response?.result?.data) {
      const date = new Date();
      yield call(telemetryService.assess, {
        learner_id: response.result.data.learner?.identifier,
        event_type: TelemetryDataEventType.LEARNER_LOGGED_IN,
        data: {
          event_timestamp: date.toLocaleString(),
          event_timestamp_epoch: date.getTime(),
        },
      });
      if (response?.result?.data?.learner.username) {
        // Sentry.setUser({
        //   id: response?.result?.data?.identifier,
        //   username: response?.result?.data?.username,
        // });
      }
      const language =
        (localStorageService.getLocalStorageValue(
          CONTENT_LANG
        ) as keyof typeof SupportedLanguages) ?? SupportedLanguages.en;
      toastService.showSuccess(
        getTranslatedString(language, multiLangLabels.logged_in_successfully)
      );
      yield put(
        authLoginCompletedAction({
          learner: response?.result?.data.learner,
          tenant: response?.result?.data.tenant,
        })
      );

      const boardId =
        response?.result?.data?.learner?.taxonomy?.board?.identifier;
      if (boardId) {
        yield put(fetchBoard(boardId));
      }

      yield put(
        fetchLearnerJourney(response?.result?.data?.learner.identifier)
      );
    }
  } catch (e: any) {
    toastService.showError(`${e?.response?.data?.error?.message}`);
    yield put(
      authLoginErrorAction(e?.response?.data?.error?.code || e?.message)
    );
  }
}

function* fetchLoggedInUserSaga(): any {
  try {
    const response: {
      responseCode: any;
      result: { data: { learner: Learner; tenant: Tenant } };
    } = yield call(authService.fetchMe);
    if (response.responseCode === 'OK' && response?.result?.data) {
      const date = new Date();
      yield call(telemetryService.assess, {
        learner_id: response.result.data.learner?.identifier,
        event_type: TelemetryDataEventType.LEARNER_RESUMED_SESSION,
        data: {
          event_timestamp: date.toLocaleString(),
          event_timestamp_epoch: date.getTime(),
        },
      });
      if (response?.result?.data?.learner?.username) {
        // Sentry.setUser({
        //   id: response?.result?.data?.identifier,
        //   username: response?.result?.data?.username,
        // });
      }
      yield put(authFetchMeCompletedAction(response?.result?.data));

      const boardId =
        response?.result?.data?.learner?.taxonomy?.board?.identifier;
      if (boardId) {
        yield put(fetchBoard(boardId));
      }

      yield put(
        fetchLearnerJourney(response?.result?.data?.learner?.identifier)
      );
    }
  } catch (e: any) {
    localStorageService.removeAuthToken();
    yield put(authFetchMeErrorAction(e?.message));
  }
}

function* fetchCSRFTokenSaga(): any {
  try {
    const response = yield call(authService.fetchCSRFToken);
    yield put(fetchCSRFTokenCompleted(response.csrfToken));
    localStorageService.setCSRFToken(response.csrfToken);
  } catch (e: any) {
    localStorageService.removeCSRFToken();
    yield put(fetchCSRFTokenFailed(e?.message));
  }
}

function* logoutSaga(): any {
  try {
    const learnerId = yield select(learnerIdSelector);
    const response = yield call(authService.logout);
    if (response) {
      const date = new Date();
      yield call(telemetryService.assess, {
        learner_id: learnerId,
        event_type: TelemetryDataEventType.LEARNER_SINGED_OUT,
        data: {
          event_timestamp: date.toLocaleString(),
          event_timestamp_epoch: date.getTime(),
        },
      });
      const language =
        (localStorageService.getLocalStorageValue(
          CONTENT_LANG
        ) as keyof typeof SupportedLanguages) ?? SupportedLanguages.en;
      localStorageService.removeCSRFToken();
      yield put(navigateTo('/login'));
      yield put(authLogoutCompletedAction());
      yield put(syncTelemetryData(true));
      // Sentry.setUser(null);
      toastService.showSuccess(
        getTranslatedString(language, multiLangLabels.logged_out_successfully)
      );
    }
  } catch (e: any) {
    localStorageService.removeCSRFToken();
    toastService.showError(`${e?.message}`);
    yield put(authFetchMeErrorAction(e?.message));
  }
}
function* authSaga() {
  yield all([
    takeLatest(AuthActionType.LOGIN, loginSaga),
    takeLatest(AuthActionType.FETCH_ME, fetchLoggedInUserSaga),
    takeLatest(AuthActionType.LOGOUT, logoutSaga),
    takeLatest(CSRFTokenActionType.FETCH_CSRF_TOKEN, fetchCSRFTokenSaga),
  ]);
}

export default authSaga;
