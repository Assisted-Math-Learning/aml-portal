import { QuestionSet } from 'models/entities/QuestionSet';
import { baseApiService } from './BaseApiService';

class QuestionSetService {
  static getInstance(): QuestionSetService {
    return new QuestionSetService();
  }

  async fetchQuestionSet(data: {
    question_set_id: string;
  }): Promise<QuestionSet> {
    return baseApiService.get(
      `/api/v1/portal/question-set/read/${data.question_set_id}`
    );
  }
}

export const questionSetService = QuestionSetService.getInstance();
