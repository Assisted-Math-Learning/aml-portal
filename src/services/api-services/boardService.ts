import { baseApiService } from './BaseApiService';

class BoardService {
  static getInstance(): BoardService {
    return new BoardService();
  }

  async fetchBoard(data: { board_id: string }): Promise<any> {
    return baseApiService.get(`/api/v1/portal/board/read/${data.board_id}`);
  }
}

export const boardService = BoardService.getInstance();
