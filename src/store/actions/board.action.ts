import { FetchBoardActionType } from './actions.constants';

export const fetchBoard = (boardId: string) => ({
  type: FetchBoardActionType.FETCH_BOARD,
  payload: boardId,
});

export const fetchBoardCompleted = (board: any) => ({
  type: FetchBoardActionType.FETCH_BOARD_COMPLETED,
  payload: board,
});

export const fetchBoardError = (error: string) => ({
  type: FetchBoardActionType.FETCH_BOARD_ERROR,
  payload: error,
});
