class TelemetryService {
  static getInstance(): TelemetryService {
    return new TelemetryService();
  }

  assess(data: any) {
    console.log('assessing', data);
  }
}

const telemetryService = TelemetryService.getInstance();

export default telemetryService;
