import { baseApiService } from './BaseApiService';

class SyncLearnerResponseService {
  static getInstance(): SyncLearnerResponseService {
    return new SyncLearnerResponseService();
  }

  async syncLearnerResponse(
    data: any
  ): Promise<{ data: { question_set_id: string } }> {
    return baseApiService.post(
      `/api/v1/portal/learner/proficiency-data/sync`,
      'api.learner.proficiency-data.sync',
      data,
      {
        extras: { useAuth: false },
      }
    );
  }
}

export const syncLearnerResponseService =
  SyncLearnerResponseService.getInstance();
