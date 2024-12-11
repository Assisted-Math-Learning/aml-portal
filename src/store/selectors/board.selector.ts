import { createSelector } from 'reselect';
import { AppState } from 'store/reducers';
import { BoardState } from 'store/reducers/board.reducer';

const boardState = (state: AppState) => state.boardReducer;

export const isBoardLoading = createSelector(
  [boardState],
  (state: BoardState) => state.loading
);

export const supportedLanguages = createSelector(
  [boardState],
  (state: BoardState) => state.board.supportedLanguages
);
