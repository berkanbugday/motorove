import Config from 'react-native-config';

/**
 * Application environment configuration
 * Uses react-native-config to access environment-specific variables
 */
export const AppConfig = {
  /**
   * API URL for backend services
   */
  API_URL: Config.API_URL || 'https://dev-api.motorove.app',

  /**
   * Current application environment (development, staging, production)
   */
  APP_ENV: Config.APP_ENV || 'development',

  /**
   * Mapbox access token
   */
  MAPBOX_ACCESS_TOKEN: Config.MAPBOX_ACCESS_TOKEN || '',

  /**
   * Whether detailed logging is enabled
   */
  ENABLE_LOGS: Config.ENABLE_LOGS === 'true',

  /**
   * API request timeout in milliseconds
   */
  API_TIMEOUT: parseInt(Config.API_TIMEOUT || '15000', 10),

  /**
   * App version information
   */
  APP_VERSION: {
    version: Config.APP_VERSION || '1.0.0',
    buildNumber: parseInt(Config.APP_BUILD_NUMBER || '1', 10),
    versionCode: parseInt(Config.APP_VERSION_CODE || '1', 10),
    versionWithBuild: `${Config.APP_VERSION || '1.0.0'} (${
      Config.APP_BUILD_NUMBER || '1'
    })`,
  },

  /**
   * App identifiers
   */
  APP_NAME: Config.APP_NAME || 'Motorove Dev',
  APP_BUNDLE_ID: Config.APP_BUNDLE_ID || 'com.motorove.dev',

  /**
   * Feature flags
   */
  DEBUG_MODE: Config.DEBUG_MODE === 'true',
  ANALYTICS_ENABLED: Config.ANALYTICS_ENABLED !== 'false',
  CRASH_REPORTING_ENABLED: Config.CRASH_REPORTING_ENABLED !== 'false',

  /**
   * Returns true if app is running in development environment
   */
  isDevelopment: (): boolean => AppConfig.APP_ENV === 'development',

  /**
   * Returns true if app is running in staging environment
   */
  isStaging: (): boolean => AppConfig.APP_ENV === 'staging',

  /**
   * Returns true if app is running in production environment
   */
  isProduction: (): boolean => AppConfig.APP_ENV === 'production',

  /**
   * Returns the full app version string (version + build number)
   */
  getFullVersion: (): string => AppConfig.APP_VERSION.versionWithBuild,

  /**
   * Log environment details for debugging
   */
  logEnvironmentInfo: (): void => {
    if (AppConfig.isDevelopment() || AppConfig.isStaging()) {
      console.log('Environment:', AppConfig.APP_ENV);
      console.log('API URL:', AppConfig.API_URL);
      console.log('App Version:', AppConfig.getFullVersion());
      console.log('Debug Mode:', AppConfig.DEBUG_MODE);
      console.log('Analytics Enabled:', AppConfig.ANALYTICS_ENABLED);
    }
  },
};

export default AppConfig;
