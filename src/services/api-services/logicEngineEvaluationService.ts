import { baseApiService } from './BaseApiService';

class LogicEngineEvalutionService {
  static getInstance(): LogicEngineEvalutionService {
    return new LogicEngineEvalutionService();
  }

  async fetchLogicEngineEvaluation(data: {
    learner_id: string;
  }): Promise<{ data: { question_set_id: string } }> {
    return baseApiService.get(`/learner/evaluate/${data.learner_id}`);
  }
}

export const logicEngineEvalutionService =
  LogicEngineEvalutionService.getInstance();