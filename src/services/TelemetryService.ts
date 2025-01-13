import { indexedDBService } from './IndexedDBService';
import { IDBDataStatus, IDBStores } from '../types/enum';

class TelemetryService {
  static getInstance(): TelemetryService {
    return new TelemetryService();
  }

  async assess(data: any) {
    await indexedDBService.addObject(
      { ...data, status: IDBDataStatus.NOOP },
      IDBStores.TELEMETRY_DATA
    );
  }
}

const telemetryService = TelemetryService.getInstance();

export default telemetryService;
