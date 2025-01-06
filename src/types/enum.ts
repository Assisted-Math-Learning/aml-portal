export enum RouteKey {
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  INSTRUCTIONS = 'instructions',
  CONTINUE_JOURNEY = 'continue-journey',
  WELCOME = 'welcome',
  QUESTIONS = 'questions',
  COMPLETED = 'completed',
}

export enum IDBDataStatus {
  NOOP = 'noop',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  REVISITED = 'revisited',
}

export enum SupportedLanguages {
  en = 'en',
  kn = 'kn',
  hi = 'hi',
}

export enum SupportedLanguagesLabels {
  en = 'English',
  kn = 'ಕನ್ನಡ',
  hi = 'हिंदी',
}

export enum IDBStores {
  LEARNER_DATA = 'learner_data',
  TELEMETRY_DATA = 'telemetry_data',
}
