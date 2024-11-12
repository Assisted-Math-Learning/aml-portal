/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BE_BASE_URL: string;
  readonly VITE_REACT_APP_ENV: 'develop' | 'staging' | 'production';
  readonly VITE_APP_VERSION: string;
  readonly VITE_SENTRY_DSN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
