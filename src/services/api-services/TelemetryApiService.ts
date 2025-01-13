import ENV_CONFIG from '../../constant/env.config';
import { BaseApiService } from './BaseApiService';

const TELEMETRY_BASE_URL = ENV_CONFIG.TELEMETRY_SERVICE_BACKEND_URL as string;

const baseApiService = new BaseApiService(TELEMETRY_BASE_URL, false);

class TelemetryApiService {
  static getInstance() {
    return new TelemetryApiService();
  }

  async syncData(data: any) {
    return baseApiService.postTelemetry('/v1/telemetry', { events: data });
  }
}

export const telemetryService = TelemetryApiService.getInstance();
