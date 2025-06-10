declare module 'react-native-config' {
  interface Env {
    // API and environment
    API_URL: string;
    APP_ENV: string;
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

    // Firebase
    FIREBASE_API_KEY: string;
    FIREBASE_AUTH_DOMAIN: string;
    FIREBASE_PROJECT_ID: string;
    FIREBASE_STORAGE_BUCKET: string;
    FIREBASE_MESSAGING_SENDER_ID: string;
    FIREBASE_APP_ID: string;
    FIREBASE_DATABASE_URL: string;
    // Allow for additional keys
    [key: string]: string | undefined;
  }
  const Config: Env;
  export default Config;
}
