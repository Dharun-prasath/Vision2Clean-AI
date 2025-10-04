/// <reference types="vite/client" />

// Extend Vite's env interface
interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_ENVIRONMENT: string;
  readonly VITE_APP_DEBUG: string;
  readonly VITE_APP_BASE_URL: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_API_RETRY_ATTEMPTS: string;
  readonly VITE_API_RETRY_DELAY: string;
  readonly VITE_AUTH_TOKEN_KEY: string;
  readonly VITE_AUTH_REFRESH_TOKEN_KEY: string;
  readonly VITE_SESSION_TIMEOUT: string;
  readonly VITE_ENABLE_CSRF: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_NOTIFICATIONS: string;
  readonly VITE_ENABLE_PWA: string;
  readonly VITE_ENABLE_OFFLINE_MODE: string;
  readonly VITE_ENABLE_REAL_TIME: string;
  readonly VITE_ENABLE_EXPORT: string;
  readonly VITE_GOOGLE_ANALYTICS_ID: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_MAPBOX_ACCESS_TOKEN: string;
  readonly VITE_WEBSOCKET_URL: string;
  readonly VITE_CACHE_TTL: string;
  readonly VITE_MAX_CONCURRENT_REQUESTS: string;
  readonly VITE_CHUNK_SIZE_WARNING_LIMIT: string;
  readonly VITE_ENABLE_SOURCE_MAPS: string;
  readonly VITE_LOG_LEVEL: string;
  readonly VITE_ENABLE_PERFORMANCE_MONITORING: string;
  readonly VITE_ENABLE_ERROR_REPORTING: string;
  readonly VITE_ENABLE_USER_FEEDBACK: string;
  readonly VITE_STORAGE_PREFIX: string;
  readonly VITE_MAX_STORAGE_SIZE: string;
  readonly VITE_ENABLE_STORAGE_ENCRYPTION: string;
  readonly VITE_ENABLE_DEVTOOLS: string;
  readonly VITE_ENABLE_REDUX_DEVTOOLS: string;
  readonly VITE_ENABLE_REACT_PROFILER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}