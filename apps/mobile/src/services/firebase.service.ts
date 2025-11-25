import {Platform, AppState} from 'react-native';
import {AppConfig} from '@configs/appConfig';
import {loggingService} from './logging.service';
import {getApps, initializeApp} from '@react-native-firebase/app';
import {getFirebaseConfig} from '@configs';

// Type imports for TypeScript
import type {FirebasePerformanceTypes} from '@react-native-firebase/perf';

/**
 * Firebase service for initializing and managing Crashlytics, Performance monitoring, and Analytics
 */
class FirebaseService {
  private static instance: FirebaseService | null = null;
  private initialized = false;
  private crashlyticsEnabled = false;
  private performanceEnabled = false;
  private analyticsEnabled = false;

  // Private constructor to enforce singleton pattern
  private constructor() {}

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Initialize Firebase services (Crashlytics, Performance, and Analytics)
   * Note: On Android, Firebase is automatically initialized from google-services.json
   * On iOS, it's initialized from GoogleService-Info.plist
   * We only need to programmatically initialize if neither file exists
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Ensure app is in foreground before initializing Firebase
      if (AppState.currentState !== 'active') {
        if (AppConfig.DEBUG_MODE) {
          loggingService.debug(
            'App not in active state, delaying Firebase initialization',
          );
        }
        // Wait for app to become active
        await new Promise<void>(resolve => {
          const subscription = AppState.addEventListener(
            'change',
            (nextAppState: string) => {
              if (nextAppState === 'active') {
                subscription.remove();
                resolve();
              }
            },
          );
          // Timeout after 5 seconds to prevent infinite waiting
          setTimeout(() => {
            subscription.remove();
            resolve();
          }, 5000);
        });
      }

      // Wait a bit to ensure native modules are loaded (especially important on Android)
      // This prevents crashes when Firebase tries to access native modules
      await new Promise(resolve => setTimeout(resolve, 200));

      // Check if Firebase is already initialized (from google-services.json or GoogleService-Info.plist)
      let apps;
      try {
        apps = getApps();
      } catch (error) {
        // If getApps() fails, native modules might not be ready yet
        loggingService.warning(
          'Firebase native modules not ready yet. Skipping Firebase initialization.',
          {
            error: error instanceof Error ? error.message : String(error),
          },
        );
        // Mark as initialized to prevent retry loops, but don't enable services
        this.initialized = true;
        return;
      }

      if (apps.length === 0) {
        // Only initialize programmatically if Firebase hasn't been initialized by native config files
        // This is rare - usually google-services.json or GoogleService-Info.plist handles initialization
        try {
          const config = getFirebaseConfig();

          // Validate config before initializing
          if (!config.apiKey || !config.projectId || !config.appId) {
            loggingService.warning(
              'Firebase config incomplete. Skipping programmatic initialization. ' +
                'Make sure google-services.json (Android) or GoogleService-Info.plist (iOS) exists.',
            );
            // Mark as initialized to prevent retry loops
            this.initialized = true;
            return;
          }

          await initializeApp(config);

          if (AppConfig.DEBUG_MODE) {
            loggingService.debug('Firebase initialized programmatically');
          }
        } catch (initError) {
          // If programmatic init fails, Firebase might already be initialized natively
          // or config files might be missing - log but continue
          loggingService.warning(
            'Programmatic Firebase initialization failed. ' +
              'This is normal if google-services.json or GoogleService-Info.plist exists.',
            {
              error:
                initError instanceof Error
                  ? initError.message
                  : String(initError),
            },
          );
        }
      } else {
        if (AppConfig.DEBUG_MODE) {
          loggingService.debug(
            `Firebase already initialized (${apps.length} app(s) found)`,
          );
        }
      }

      // Initialize Analytics (should be initialized first)
      await this.initializeAnalytics();

      // Initialize Crashlytics
      await this.initializeCrashlytics();

      // Initialize Performance Monitoring
      await this.initializePerformance();

      this.initialized = true;

      if (AppConfig.DEBUG_MODE) {
        loggingService.info('Firebase services initialized successfully', {
          analytics: this.analyticsEnabled,
          crashlytics: this.crashlyticsEnabled,
          performance: this.performanceEnabled,
        });
      }
    } catch (error) {
      loggingService.error('Failed to initialize Firebase services:', error);
      // Mark as initialized to prevent retry loops, but log the error
      this.initialized = true;
      // Don't throw - allow app to continue even if Firebase fails
    }
  }

  /**
   * Initialize Crashlytics
   */
  private async initializeCrashlytics(): Promise<void> {
    try {
      // Only enable Crashlytics if crash reporting is enabled in config
      if (!AppConfig.CRASH_REPORTING_ENABLED) {
        if (AppConfig.DEBUG_MODE) {
          loggingService.debug('Crashlytics disabled by configuration');
        }
        return;
      }

      // Verify Firebase app is initialized before proceeding
      const apps = getApps();
      if (apps.length === 0) {
        if (AppConfig.DEBUG_MODE) {
          loggingService.debug(
            'Skipping Crashlytics initialization - Firebase app not initialized',
          );
        }
        return;
      }

      // Lazy load crashlytics module after Firebase is initialized
      let crashlyticsModule;
      try {
        crashlyticsModule = await import('@react-native-firebase/crashlytics');
      } catch (importError) {
        loggingService.error(
          'Failed to import Crashlytics module. Make sure @react-native-firebase/crashlytics is installed.',
          importError,
        );
        return;
      }

      const crashlytics = crashlyticsModule.default;

      if (!crashlytics) {
        loggingService.error('Crashlytics module not available');
        return;
      }

      // Enable Crashlytics collection
      await crashlytics().setCrashlyticsCollectionEnabled(true);

      // Set user identifier if available (can be set later when user logs in)
      // This helps identify which users are experiencing crashes

      // Set custom attributes
      await crashlytics().setAttribute('environment', AppConfig.APP_ENV);
      await crashlytics().setAttribute('platform', Platform.OS);
      await crashlytics().setAttribute(
        'app_version',
        AppConfig.APP_VERSION.version,
      );
      await crashlytics().setAttribute(
        'build_number',
        AppConfig.APP_VERSION.buildNumber.toString(),
      );

      this.crashlyticsEnabled = true;

      if (AppConfig.DEBUG_MODE) {
        loggingService.debug('Crashlytics initialized successfully');
      }
    } catch (error) {
      loggingService.error('Failed to initialize Crashlytics:', error);
      // Don't throw - allow app to continue
    }
  }

  /**
   * Initialize Firebase Analytics
   */
  private async initializeAnalytics(): Promise<void> {
    try {
      // Only enable Analytics if analytics is enabled in config
      if (!AppConfig.ANALYTICS_ENABLED) {
        if (AppConfig.DEBUG_MODE) {
          loggingService.debug('Analytics disabled by configuration');
        }
        return;
      }

      // Verify Firebase app is initialized before proceeding
      const apps = getApps();
      if (apps.length === 0) {
        if (AppConfig.DEBUG_MODE) {
          loggingService.debug(
            'Skipping Analytics initialization - Firebase app not initialized',
          );
        }
        return;
      }

      // Lazy load analytics module after Firebase is initialized
      let analyticsModule;
      try {
        analyticsModule = await import('@react-native-firebase/analytics');
      } catch (importError) {
        loggingService.error(
          'Failed to import Analytics module. Make sure @react-native-firebase/analytics is installed.',
          importError,
        );
        return;
      }

      const analytics = analyticsModule.default;

      if (!analytics) {
        loggingService.error('Analytics module not available');
        return;
      }

      // Enable Analytics collection
      await analytics().setAnalyticsCollectionEnabled(true);

      // Set default event parameters
      await analytics().setDefaultEventParameters({
        environment: AppConfig.APP_ENV,
        platform: Platform.OS,
        app_version: AppConfig.APP_VERSION.version,
        build_number: AppConfig.APP_VERSION.buildNumber.toString(),
      });

      this.analyticsEnabled = true;

      if (AppConfig.DEBUG_MODE) {
        loggingService.debug('Analytics initialized successfully');
      }
    } catch (error) {
      loggingService.error('Failed to initialize Analytics:', error);
      // Don't throw - allow app to continue
    }
  }

  /**
   * Initialize Performance Monitoring
   */
  private async initializePerformance(): Promise<void> {
    try {
      // Only enable Performance if analytics is enabled in config
      if (!AppConfig.ANALYTICS_ENABLED) {
        if (AppConfig.DEBUG_MODE) {
          loggingService.debug(
            'Performance monitoring disabled by configuration',
          );
        }
        return;
      }

      // Verify Firebase app is initialized before proceeding
      const apps = getApps();
      if (apps.length === 0) {
        if (AppConfig.DEBUG_MODE) {
          loggingService.debug(
            'Skipping Performance initialization - Firebase app not initialized',
          );
        }
        return;
      }

      // Performance collection is enabled by default in Firebase v23+
      // No need to explicitly enable it - it's controlled via Firebase Console
      // or native configuration files
      this.performanceEnabled = true;

      if (AppConfig.DEBUG_MODE) {
        loggingService.debug('Performance monitoring initialized successfully');
      }
    } catch (error) {
      loggingService.error(
        'Failed to initialize Performance monitoring:',
        error,
      );
      // Don't throw - allow app to continue
    }
  }

  /**
   * Set user identifier for Crashlytics and Analytics
   * Call this when user logs in
   */
  async setUserId(userId: string): Promise<void> {
    try {
      // Set user ID for Crashlytics
      if (this.crashlyticsEnabled) {
        try {
          const crashlytics = (
            await import('@react-native-firebase/crashlytics')
          ).default;
          await crashlytics().setUserId(userId);
          if (AppConfig.DEBUG_MODE) {
            loggingService.debug('Crashlytics user ID set', {userId});
          }
        } catch (error) {
          loggingService.error('Failed to set Crashlytics user ID:', error);
        }
      }

      // Set user ID for Analytics
      if (this.analyticsEnabled) {
        try {
          const analytics = (await import('@react-native-firebase/analytics'))
            .default;
          await analytics().setUserId(userId);
          if (AppConfig.DEBUG_MODE) {
            loggingService.debug('Analytics user ID set', {userId});
          }
        } catch (error) {
          loggingService.error('Failed to set Analytics user ID:', error);
        }
      }
    } catch (error) {
      loggingService.error('Failed to set user ID:', error);
    }
  }

  /**
   * Reset user identifier (call on logout)
   */
  async resetUserId(): Promise<void> {
    try {
      // Reset user ID for Crashlytics
      if (this.crashlyticsEnabled) {
        try {
          const crashlytics = (
            await import('@react-native-firebase/crashlytics')
          ).default;
          await crashlytics().setUserId('');
        } catch (error) {
          loggingService.error('Failed to reset Crashlytics user ID:', error);
        }
      }

      // Reset user ID for Analytics
      if (this.analyticsEnabled) {
        try {
          const analytics = (await import('@react-native-firebase/analytics'))
            .default;
          await analytics().resetAnalyticsData();
          if (AppConfig.DEBUG_MODE) {
            loggingService.debug('Analytics data reset');
          }
        } catch (error) {
          loggingService.error('Failed to reset Analytics data:', error);
        }
      }
    } catch (error) {
      loggingService.error('Failed to reset user ID:', error);
    }
  }

  /**
   * Set user attributes for Crashlytics
   * Useful for filtering crashes by user properties
   */
  async setUserAttribute(key: string, value: string): Promise<void> {
    if (!this.crashlyticsEnabled) {
      return;
    }

    try {
      const crashlytics = (await import('@react-native-firebase/crashlytics'))
        .default;
      await crashlytics().setAttribute(key, value);
    } catch (error) {
      loggingService.error('Failed to set Crashlytics user attribute:', error);
    }
  }

  /**
   * Log a custom message to Crashlytics
   */
  async log(message: string): Promise<void> {
    if (!this.crashlyticsEnabled) {
      return;
    }

    try {
      const crashlytics = (await import('@react-native-firebase/crashlytics'))
        .default;
      crashlytics().log(message);
    } catch (error) {
      loggingService.error('Failed to log to Crashlytics:', error);
    }
  }

  /**
   * Record a non-fatal error to Crashlytics
   */
  async recordError(error: Error, jsErrorName?: string): Promise<void> {
    if (!this.crashlyticsEnabled) {
      return;
    }

    try {
      const crashlytics = (await import('@react-native-firebase/crashlytics'))
        .default;
      crashlytics().recordError(error, jsErrorName);
    } catch (err) {
      loggingService.error('Failed to record error to Crashlytics:', err);
    }
  }

  /**
   * Start a performance trace
   * Returns a trace object that can be stopped
   */
  async startTrace(
    traceName: string,
  ): Promise<FirebasePerformanceTypes.Trace | null> {
    if (!this.performanceEnabled) {
      return null;
    }

    try {
      const perf = (await import('@react-native-firebase/perf')).default;
      return perf().newTrace(traceName);
    } catch (error) {
      loggingService.error('Failed to start performance trace:', error);
      return null;
    }
  }

  /**
   * Start an HTTP metric trace
   * Returns a metric object that can be stopped
   */
  async startHttpMetric(
    url: string,
    method: FirebasePerformanceTypes.HttpMethod,
  ): Promise<FirebasePerformanceTypes.HttpMetric | null> {
    if (!this.performanceEnabled) {
      return null;
    }

    try {
      const perf = (await import('@react-native-firebase/perf')).default;
      return perf().newHttpMetric(url, method);
    } catch (error) {
      loggingService.error('Failed to start HTTP metric:', error);
      return null;
    }
  }

  /**
   * Check if Crashlytics is enabled
   */
  isCrashlyticsEnabled(): boolean {
    return this.crashlyticsEnabled;
  }

  /**
   * Check if Performance monitoring is enabled
   */
  isPerformanceEnabled(): boolean {
    return this.performanceEnabled;
  }

  /**
   * Check if Analytics is enabled
   */
  isAnalyticsEnabled(): boolean {
    return this.analyticsEnabled;
  }

  /**
   * Check if Firebase services are initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Set user property for Analytics
   * User properties are attributes that describe segments of your user base
   */
  async setUserProperty(name: string, value: string | null): Promise<void> {
    if (!this.analyticsEnabled) {
      return;
    }

    try {
      const analytics = (await import('@react-native-firebase/analytics'))
        .default;
      await analytics().setUserProperty(name, value);
      if (AppConfig.DEBUG_MODE) {
        loggingService.debug('Analytics user property set', {name, value});
      }
    } catch (error) {
      loggingService.error('Failed to set Analytics user property:', error);
    }
  }

  /**
   * Log a custom event to Analytics
   */
  async logEvent(
    eventName: string,
    parameters?: {[key: string]: any},
  ): Promise<void> {
    if (!this.analyticsEnabled) {
      return;
    }

    try {
      const analytics = (await import('@react-native-firebase/analytics'))
        .default;
      await analytics().logEvent(eventName, parameters);
      if (AppConfig.DEBUG_MODE) {
        loggingService.debug('Analytics event logged', {eventName, parameters});
      }
    } catch (error) {
      loggingService.error('Failed to log Analytics event:', error);
    }
  }

  /**
   * Set the current screen name for Analytics
   * This helps track which screens users are viewing
   */
  async setCurrentScreen(
    screenName: string,
    screenClass?: string,
  ): Promise<void> {
    if (!this.analyticsEnabled) {
      return;
    }

    try {
      const analytics = (await import('@react-native-firebase/analytics'))
        .default;
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
      if (AppConfig.DEBUG_MODE) {
        loggingService.debug('Analytics screen view logged', {
          screenName,
          screenClass: screenClass || screenName,
        });
      }
    } catch (error) {
      loggingService.error('Failed to set Analytics screen:', error);
    }
  }
}

// Export singleton instance
export const firebaseService = FirebaseService.getInstance();
