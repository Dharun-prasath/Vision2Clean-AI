/**
 * Vision2Clean AI - Configuration Management
 * Centralized configuration system with environment-specific settings
 */

// Environment type definitions
export type Environment = 'development' | 'staging' | 'production';

// Configuration interface
interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: Environment;
    debug: boolean;
    baseUrl: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  auth: {
    tokenKey: string;
    refreshTokenKey: string;
    sessionTimeout: number;
    enableCSRF: boolean;
  };
  features: {
    analytics: boolean;
    notifications: boolean;
    pwa: boolean;
    offlineMode: boolean;
    realTime: boolean;
    export: boolean;
  };
  external: {
    googleAnalyticsId?: string;
    sentryDsn?: string;
    mapboxToken?: string;
    websocketUrl?: string;
  };
  performance: {
    cacheTTL: number;
    maxConcurrentRequests: number;
    chunkSizeWarningLimit: number;
    enableSourceMaps: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enablePerformanceMonitoring: boolean;
    enableErrorReporting: boolean;
    enableUserFeedback: boolean;
  };
  storage: {
    prefix: string;
    maxSize: string;
    enableEncryption: boolean;
  };
  devTools: {
    enableDevtools: boolean;
    enableReduxDevtools: boolean;
    enableReactProfiler: boolean;
  };
}

// Helper function to get environment variable with type safety
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  const value = import.meta.env[key];
  return value !== undefined ? value : defaultValue;
};

const getBooleanEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  const value = import.meta.env[key];
  return value === 'true' || (value === undefined && defaultValue);
};

const getNumberEnvVar = (key: string, defaultValue: number = 0): number => {
  const value = import.meta.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

// Main configuration object
export const config: AppConfig = {
  app: {
    name: getEnvVar('VITE_APP_NAME', 'Vision2Clean AI'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
    environment: getEnvVar('VITE_APP_ENVIRONMENT', 'development') as Environment,
    debug: getBooleanEnvVar('VITE_APP_DEBUG', false),
    baseUrl: getEnvVar('VITE_APP_BASE_URL', window.location.origin),
  },
  api: {
    baseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8000/api/v1'),
    timeout: getNumberEnvVar('VITE_API_TIMEOUT', 30000),
    retryAttempts: getNumberEnvVar('VITE_API_RETRY_ATTEMPTS', 3),
    retryDelay: getNumberEnvVar('VITE_API_RETRY_DELAY', 1000),
  },
  auth: {
    tokenKey: getEnvVar('VITE_AUTH_TOKEN_KEY', 'vision2clean_auth_token'),
    refreshTokenKey: getEnvVar('VITE_AUTH_REFRESH_TOKEN_KEY', 'vision2clean_refresh_token'),
    sessionTimeout: getNumberEnvVar('VITE_SESSION_TIMEOUT', 3600000),
    enableCSRF: getBooleanEnvVar('VITE_ENABLE_CSRF', true),
  },
  features: {
    analytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', true),
    notifications: getBooleanEnvVar('VITE_ENABLE_NOTIFICATIONS', true),
    pwa: getBooleanEnvVar('VITE_ENABLE_PWA', true),
    offlineMode: getBooleanEnvVar('VITE_ENABLE_OFFLINE_MODE', true),
    realTime: getBooleanEnvVar('VITE_ENABLE_REAL_TIME', true),
    export: getBooleanEnvVar('VITE_ENABLE_EXPORT', true),
  },
  external: {
    googleAnalyticsId: getEnvVar('VITE_GOOGLE_ANALYTICS_ID'),
    sentryDsn: getEnvVar('VITE_SENTRY_DSN'),
    mapboxToken: getEnvVar('VITE_MAPBOX_ACCESS_TOKEN'),
    websocketUrl: getEnvVar('VITE_WEBSOCKET_URL'),
  },
  performance: {
    cacheTTL: getNumberEnvVar('VITE_CACHE_TTL', 300000),
    maxConcurrentRequests: getNumberEnvVar('VITE_MAX_CONCURRENT_REQUESTS', 10),
    chunkSizeWarningLimit: getNumberEnvVar('VITE_CHUNK_SIZE_WARNING_LIMIT', 1000),
    enableSourceMaps: getBooleanEnvVar('VITE_ENABLE_SOURCE_MAPS', false),
  },
  logging: {
    level: getEnvVar('VITE_LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error',
    enablePerformanceMonitoring: getBooleanEnvVar('VITE_ENABLE_PERFORMANCE_MONITORING', true),
    enableErrorReporting: getBooleanEnvVar('VITE_ENABLE_ERROR_REPORTING', true),
    enableUserFeedback: getBooleanEnvVar('VITE_ENABLE_USER_FEEDBACK', true),
  },
  storage: {
    prefix: getEnvVar('VITE_STORAGE_PREFIX', 'vision2clean_'),
    maxSize: getEnvVar('VITE_MAX_STORAGE_SIZE', '50MB'),
    enableEncryption: getBooleanEnvVar('VITE_ENABLE_STORAGE_ENCRYPTION', false),
  },
  devTools: {
    enableDevtools: getBooleanEnvVar('VITE_ENABLE_DEVTOOLS', false),
    enableReduxDevtools: getBooleanEnvVar('VITE_ENABLE_REDUX_DEVTOOLS', false),
    enableReactProfiler: getBooleanEnvVar('VITE_ENABLE_REACT_PROFILER', false),
  },
};

// Environment-specific utilities
export const isDevelopment = config.app.environment === 'development';
export const isProduction = config.app.environment === 'production';
export const isStaging = config.app.environment === 'staging';

// API endpoints builder
export const endpoints = {
  auth: {
    login: `${config.api.baseUrl}/auth/login`,
    logout: `${config.api.baseUrl}/auth/logout`,
    refresh: `${config.api.baseUrl}/auth/refresh`,
    profile: `${config.api.baseUrl}/auth/profile`,
  },
  detection: {
    upload: `${config.api.baseUrl}/detection/upload`,
    analyze: `${config.api.baseUrl}/detection/analyze`,
    history: `${config.api.baseUrl}/detection/history`,
    results: (id: string) => `${config.api.baseUrl}/detection/results/${id}`,
  },
  analytics: {
    dashboard: `${config.api.baseUrl}/analytics/dashboard`,
    performance: `${config.api.baseUrl}/analytics/performance`,
    regions: `${config.api.baseUrl}/analytics/regions`,
    categories: `${config.api.baseUrl}/analytics/categories`,
    export: `${config.api.baseUrl}/analytics/export`,
  },
  system: {
    health: `${config.api.baseUrl}/system/health`,
    metrics: `${config.api.baseUrl}/system/metrics`,
    status: `${config.api.baseUrl}/system/status`,
  },
};

// Configuration validation
export const validateConfig = (): boolean => {
  const requiredFields = [
    config.api.baseUrl,
    config.auth.tokenKey,
  ];

  const missingFields = requiredFields.filter(field => !field);
  
  if (missingFields.length > 0) {
    console.error('Missing required configuration fields:', missingFields);
    return false;
  }

  return true;
};

// Debug configuration logging
if (isDevelopment && config.app.debug) {
  console.group('🔧 Vision2Clean AI Configuration');
  console.log('Environment:', config.app.environment);
  console.log('API Base URL:', config.api.baseUrl);
  console.log('Features:', config.features);
  console.log('Debug Mode:', config.app.debug);
  console.groupEnd();
}

export default config;