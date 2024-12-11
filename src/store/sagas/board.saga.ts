import { StoreAction } from 'models/StoreAction';
import { all, call, put, takeEvery } from 'redux-saga/effects';
import { boardService } from 'services/api-services/boardService';
import { FetchBoardActionType } from 'store/actions/actions.constants';
import {
  fetchBoardCompleted,
  fetchBoardError,
} from 'store/actions/board.action';

function* fetchBoardSaga({ payload }: StoreAction<FetchBoardActionType>): any {
  try {
    const response = yield call(boardService.fetchBoard, {
      board_id: payload,
    });
    yield put(fetchBoardCompleted(response.result));
  } catch (e: any) {
    yield put(
      fetchBoardError((e?.errors && e.errors[0]?.message) || e?.message)
    );
  }
}

function* boardSaga() {
  yield all([takeEvery(FetchBoardActionType.FETCH_BOARD, fetchBoardSaga)]);
}

export default boardSaga;
