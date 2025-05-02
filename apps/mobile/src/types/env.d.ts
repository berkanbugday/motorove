declare module 'react-native-config' {
  interface Env {
    // API and environment
    API_URL: string;
    APP_ENV: string;
    MAPBOX_ACCESS_TOKEN: string;
    ENABLE_LOGS: string;
    API_TIMEOUT: string;

    // App versioning
    APP_VERSION: string;
    APP_BUILD_NUMBER: string;
    APP_VERSION_CODE: string;

    // App identifiers
    APP_NAME: string;
    APP_BUNDLE_ID: string;

    // Feature flags
    DEBUG_MODE: string;
    ANALYTICS_ENABLED: string;
    CRASH_REPORTING_ENABLED: string;
    SENTRY_DSN: string;

    // Allow for additional keys
    [key: string]: string | undefined;
  }
  const Config: Env;
  export default Config;
}
