import {Platform} from 'react-native';
import {AppConfig} from './appConfig';
import {loggingService} from '@services/logging.service';
import Config from 'react-native-config';

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  databaseURL: string;
}

/**
 * Get Firebase configuration based on environment
 */
export const getFirebaseConfig = (): FirebaseConfig => {
  // Environment-specific firebase configurations
  const configurations: Record<string, FirebaseConfig> = {
    development: {
      apiKey: Config.FIREBASE_API_KEY || '',
      authDomain: Config.FIREBASE_AUTH_DOMAIN || '',
      projectId: Config.FIREBASE_PROJECT_ID || '',
      storageBucket: Config.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID || '',
      appId:
        Platform.OS === 'ios'
          ? Config.FIREBASE_APP_ID_IOS || ''
          : Config.FIREBASE_APP_ID_ANDROID || '',
      databaseURL: Config.FIREBASE_DATABASE_URL || '',
    },
    staging: {
      apiKey: Config.FIREBASE_API_KEY || '',
      authDomain: Config.FIREBASE_AUTH_DOMAIN || '',
      projectId: Config.FIREBASE_PROJECT_ID || '',
      storageBucket: Config.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID || '',
      appId:
        Platform.OS === 'ios'
          ? Config.FIREBASE_APP_ID_IOS || ''
          : Config.FIREBASE_APP_ID_ANDROID || '',
      databaseURL: Config.FIREBASE_DATABASE_URL || '',
    },
    production: {
      apiKey: Config.FIREBASE_API_KEY || '',
      authDomain: Config.FIREBASE_AUTH_DOMAIN || '',
      projectId: Config.FIREBASE_PROJECT_ID || '',
      storageBucket: Config.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID || '',
      appId:
        Platform.OS === 'ios'
          ? Config.FIREBASE_APP_ID_IOS || ''
          : Config.FIREBASE_APP_ID_ANDROID || '',
      databaseURL: Config.FIREBASE_DATABASE_URL || '',
    },
  };

  // Get current environment
  const env = AppConfig.APP_ENV;

  // Log which environment config we're using
  loggingService.debug(`Using Firebase config for environment: ${env}`);

  // Return environment-specific configuration with fallback to development
  return configurations[env] || configurations.development;
};
