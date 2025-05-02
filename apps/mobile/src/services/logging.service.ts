import * as Sentry from '@sentry/react-native';
import {AppConfig} from '@configs/appConfig';

/**
 * Logging level types
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * Breadcrumb categories
 */
export enum BreadcrumbCategory {
  NAVIGATION = 'navigation',
  HTTP = 'http',
  UI = 'ui',
  USER = 'user',
  COMPONENT = 'component',
  REDUX = 'redux',
  AUTHENTICATION = 'authentication',
  DATABASE = 'database',
  NETWORK = 'network',
}

/**
 * Log context type
 */
export type LogContext = Record<string, any>;

/**
 * Options for initialization
 */
export interface LoggingInitOptions {
  environment?: string;
  release?: string;
  enableAutoSessionTracking?: boolean;
  sessionTrackingIntervalMillis?: number;
  maxBreadcrumbs?: number;
}

/**
 * Service for application logging and error tracking
 */
class LoggingService {
  private initialized = false;

  /**
   * Initialize the logging service
   */
  initialize(options: LoggingInitOptions = {}): void {
    if (this.initialized) {
      if (AppConfig.DEBUG_MODE) {
        console.warn('Logging service already initialized');
      }
      return;
    }

    // Get Sentry DSN from environment variables
    const dsn = AppConfig.SENTRY_DSN;

    if (!dsn) {
      if (AppConfig.DEBUG_MODE) {
        console.warn('Sentry DSN not configured. Error tracking is disabled.');
      }
      return;
    }

    if (
      AppConfig.ENABLE_LOGS &&
      AppConfig.SENTRY_DSN &&
      AppConfig.SENTRY_DSN !== ''
    ) {
      // Initialize Sentry
      Sentry.init({
        dsn,
        environment: options.environment || AppConfig.APP_ENV || 'development',
        release: options.release,
        maxBreadcrumbs: options.maxBreadcrumbs || 100,
        enableAutoSessionTracking: options.enableAutoSessionTracking !== false,
        sessionTrackingIntervalMillis:
          options.sessionTrackingIntervalMillis || 30000,
        // Add debug option for development
        debug: AppConfig.DEBUG_MODE,
        // Add other options as needed
      });
    }

    this.initialized = true;
    this.info('Logging service initialized', {
      environment: AppConfig.APP_ENV,
    });
  }

  /**
   * Check if logging service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Set user information for error tracking
   */
  setUser(user: {id?: string; email?: string; username?: string} | null): void {
    Sentry.setUser(user);
  }

  /**
   * Clear user information
   */
  clearUser(): void {
    Sentry.setUser(null);
  }

  /**
   * Set extra context data for all future errors
   */
  setContext(name: string, context: LogContext): void {
    Sentry.setContext(name, context);
  }

  /**
   * Set a tag for filtering events
   */
  setTag(key: string, value: string): void {
    Sentry.setTag(key, value);
  }

  /**
   * Add a breadcrumb for tracking user actions
   */
  addBreadcrumb(
    message: string,
    category: BreadcrumbCategory = BreadcrumbCategory.USER,
    level: LogLevel = LogLevel.INFO,
    data?: LogContext,
  ): void {
    Sentry.addBreadcrumb({
      message,
      category,
      level: level as Sentry.SeverityLevel,
      data,
    });
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void {
    if (AppConfig.DEBUG_MODE) {
      console.debug(message, context);
    }

    if (this.initialized) {
      Sentry.captureMessage(message, {
        level: 'debug',
        extra: context,
      });
    }
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    if (AppConfig.DEBUG_MODE) {
      console.info(message, context);
    }

    if (this.initialized) {
      Sentry.captureMessage(message, {
        level: 'info',
        extra: context,
      });
    }
  }

  /**
   * Log a warning message
   */
  warning(message: string, context?: LogContext): void {
    if (AppConfig.DEBUG_MODE) {
      console.warn(message, context);
    }

    if (this.initialized) {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: context,
      });
    }
  }

  /**
   * Log an error message
   */
  error(message: string, error?: any, context?: LogContext): void {
    if (AppConfig.DEBUG_MODE) {
      console.error(message, error, context);
    }

    if (this.initialized) {
      if (error) {
        // If we have an actual error object, use captureException
        Sentry.captureException(error, {
          extra: {...context, message},
        });
      } else {
        // Otherwise use captureMessage with error level
        Sentry.captureMessage(message, {
          level: 'error',
          extra: context,
        });
      }
    }
  }

  /**
   * Log a fatal error message
   */
  fatal(message: string, error?: any, context?: LogContext): void {
    if (AppConfig.DEBUG_MODE) {
      console.error('FATAL:', message, error, context);
    }

    if (this.initialized) {
      if (error) {
        Sentry.captureException(error, {
          level: 'fatal',
          extra: {...context, message},
        });
      } else {
        Sentry.captureMessage(message, {
          level: 'fatal',
          extra: context,
        });
      }
    }
  }
}

export const loggingService = new LoggingService();
