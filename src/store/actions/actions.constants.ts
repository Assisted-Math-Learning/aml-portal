// Auth
export enum AuthActionType {
  LOGIN = 'auth/login',
  LOGIN_COMPLETED = 'auth/login/completed',
  LOGIN_ERROR = 'auth/login/error',

  FETCH_ME = 'auth/fetch/me',
  FETCH_ME_COMPLETED = 'auth/fetch/me/completed',
  FETCH_ME_ERROR = 'auth/fetch/me/error',

  RESET = 'store/reset',
  LOGOUT = 'store/logout',
  LOGOUT_COMPLETED = 'store/logout/completed',
}

export enum QuestionSetActionType {
  FETCH_QUESTION_SET = 'question/set/fetch',
  FETCH_QUESTION_SET_COMPLETED = 'question/set/fetch/completed',
  FETCH_QUESTION_SET_ERROR = 'question/set/fetch/error',
}

export enum QuestionActionType {
  FETCH_QUESTION = 'question/fetch',
  FETCH_QUESTION_COMPLETED = 'question/fetch/completed',
  FETCH_QUESTION_ERROR = 'question/fetch/error',
}

export enum LearnerJourneyActionType {
  FETCH_LEARNER_JOURNEY = 'fetch/learner/journey',
  FETCH_LEARNER_JOURNEY_COMPLETED = 'fetch/learner/journey/completed',
  FETCH_LEARNER_JOURNEY_FAILED = 'fetch/learner/journey/failed',
}

export enum CSRFTokenActionType {
  FETCH_CSRF_TOKEN = 'fetch/csrf/token',
  FETCH_CSRF_TOKEN_COMPLETED = 'fetch/csrf/token/completed',
  FETCH_CSRF_TOKEN_ERROR = 'fetch/csrf/token/error',
}

export enum LogicEngineActionType {
  FETCH_LOGIC_ENGINE_EVALUATION = 'fetch/learner/evaluation',
  FETCH_LOGIC_ENGINE_EVALUATION_COMPLETED = 'fetch/learner/evaluation/completed',
  FETCH_LOGIC_ENGINE_EVALUATION_ERROR = 'fetch/learner/evaluation/error',
}

export enum SyncLearnerResponseActionType {
  SYNC_LEARNER_RESPONSE = 'sync/learner/response',
  SYNC_LEARNER_RESPONSE_COMPLETED = 'sync/learner/response/completed',
  SYNC_LEARNER_RESPONSE_ERROR = 'sync/learner/response/error',
  SYNC_FINAL_LEARNER_RESPONSE = 'sync/final/learner/response',
}

export enum FetchContentActionType {
  FETCH_CONTENT = 'fetch/content',
  FETCH_CONTENT_COMPLETED = 'fetch/content/completed',
  FETCH_CONTENT_ERROR = 'fetch/content/error',
}

export enum FetchContentMediaActionType {
  FETCH_MEDIA = 'fetch/media',
  FETCH_MEDIA_COMPLETED = 'fetch/media/completed',
  FETCH_MEDIA_ERROR = 'fetch/media/error',
}

export enum FetchQuestionImageActionType {
  FETCH_QUESTION_IMAGE = 'fetch/question/image',
  FETCH_QUESTION_IMAGE_COMPLETED = 'fetch/question/image/completed',
  FETCH_QUESTION_IMAGE_ERROR = 'fetch/question/image/error',
}

export enum FetchBoardActionType {
  FETCH_BOARD = 'fetch/board',
  FETCH_BOARD_COMPLETED = 'fetch/board/completed',
  FETCH_BOARD_ERROR = 'fetch/board/error',
}
