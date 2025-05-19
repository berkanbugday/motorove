import {loggingService} from '@services/logging.service';
import Config from 'react-native-config';
import {Platform} from 'react-native';
/**
 * Application environment configuration
 * Uses react-native-config to access environment-specific variables
 */
export const AppConfig = {
  /**
   * API URL for backend services
   */
  API_URL:
    Config.APP_ENV === 'development'
      ? Platform.OS === 'ios'
        ? Config.API_URL
        : 'http://10.0.2.2:3000'
      : Config.API_URL,

  /**
   * Current application environment (development, staging, production)
   */
  APP_ENV: Config.APP_ENV,

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
  SENTRY_DSN: Config.SENTRY_DSN || '',
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
      loggingService.info('Environment:', {
        environment: AppConfig.APP_ENV,
      });
      loggingService.info('API URL:', {
        apiUrl: AppConfig.API_URL,
      });
      loggingService.info('App Version:', {
        version: AppConfig.getFullVersion(),
      });
      loggingService.info('Debug Mode:', {
        debugMode: AppConfig.DEBUG_MODE,
      });
    }
  },
};

export default AppConfig;
