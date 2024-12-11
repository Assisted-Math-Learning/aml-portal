import produce from 'immer';
import { Board } from 'models/entities/Board';
import { Reducer } from 'redux';
import { FetchBoardActionType } from 'store/actions/actions.constants';

export interface BoardState {
  loading?: boolean;
  error?: string;
  board: Board;
}

const initialState: BoardState = {
  loading: false,
  board: {
    supportedLanguages: {
      en: 'English',
    },
  },
};

export const boardReducer: Reducer<BoardState> = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: BoardState = initialState,
  action
) =>
  produce(state, (draft: BoardState) => {
    switch (action.type) {
      case FetchBoardActionType.FETCH_BOARD: {
        draft.loading = true;
        break;
      }
      case FetchBoardActionType.FETCH_BOARD_COMPLETED: {
        const board = action.payload as Board;
        draft.board = board;
        draft.loading = false;
        break;
      }
      case FetchBoardActionType.FETCH_BOARD_ERROR: {
        const error = action.payload as string;
        draft.loading = false;
        draft.error = error;
        break;
      }
      default:
        break;
    }
  });
