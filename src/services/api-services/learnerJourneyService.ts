import { LearnerJourney } from 'models/entities/LearnerJourney';
import { LearnerResponse } from 'shared-resources/utils/helpers';
import { baseApiService } from './BaseApiService';

class LearnerJourneyService {
  static getInstance(): LearnerJourneyService {
    return new LearnerJourneyService();
  }

  async fetchLearnerjourney(data: {
    learner_id: string;
  }): Promise<LearnerJourney> {
    return baseApiService.get(
      `/api/v1/learner/journey/read/${data.learner_id}`
    );
  }

  async fetchLearnerJourneyLatestResponses(data: {
    learnerId: string;
  }): Promise<
    {
      question_id: string;
      question_set_id: string;
      learner_response: LearnerResponse;
    }[]
  > {
    return baseApiService.get(
      `/api/v1/learner/journey/latest-responses/${data.learnerId}`
    );
  }
}

export const learnerJourneyService = LearnerJourneyService.getInstance();
