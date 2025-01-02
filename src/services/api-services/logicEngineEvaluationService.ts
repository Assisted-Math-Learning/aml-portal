import { baseApiService } from './BaseApiService';

class LogicEngineEvalutionService {
  static getInstance(): LogicEngineEvalutionService {
    return new LogicEngineEvalutionService();
  }

  async fetchLogicEngineEvaluation(data: {
    learner_id: string;
  }): Promise<{ data: { question_set_id: string } }> {
    return baseApiService.post(
      `/api/v1/portal/learner/evaluate/${data.learner_id}`,
      'api.learner.evaluate'
    );
  }
}

export const logicEngineEvalutionService =
  LogicEngineEvalutionService.getInstance();
