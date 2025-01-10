const ENV_CONFIG = {
  BACKEND_URL: import.meta.env.VITE_BE_BASE_URL!,
  TELEMETRY_SERVICE_BACKEND_URL: import.meta.env
    .VITE_TELEMETRY_SERVICE_BASE_URL!,
  APP_ENV: import.meta.env.VITE_REACT_APP_ENV!,
  APP_VERSION: import.meta.env.VITE_APP_VERSION!,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
};

export default ENV_CONFIG;
