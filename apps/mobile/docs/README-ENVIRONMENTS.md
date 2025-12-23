# Environment Configuration

This document explains how to set up and configure environment-specific settings for the Motorove mobile app.

## Environment Files

The application uses the following environment files:

1. `.env.dev` - Development environment configuration
2. `.env.staging` - Staging environment configuration
3. `.env` - Production environment configuration

These files are not committed to the repository for security reasons. You need to create them based on the examples provided.

## Setup Instructions

1. Copy the example files to create your environment configurations:

   ```bash
   cp .env.dev.example .env.dev
   cp .env.staging.example .env.staging
   cp .env.example .env
   ```

2. Update the values in each file according to your environment settings

## Example Environment Files

### Development (.env.dev)

```
# Development Environment Configuration

# App Settings
APP_NAME=Motorove Dev
APP_ENV=development
APP_VERSION=1.0.0
APP_BUILD_NUMBER=1
APP_VERSION_CODE=1
APP_BUNDLE_ID=com.motorove.dev

# API Settings
API_URL=http://localhost:3000
API_TIMEOUT=15000

# Debug Settings
DEBUG_MODE=true
ENABLE_LOGS=true

# Analytics
ANALYTICS_ENABLED=true
CRASH_REPORTING_ENABLED=true
SENTRY_DSN=

# Firebase Configuration - Development
FIREBASE_API_KEY=your_dev_api_key
FIREBASE_AUTH_DOMAIN=your_dev_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_dev_project
FIREBASE_MESSAGING_SENDER_ID=your_dev_sender_id
FIREBASE_APP_ID_IOS=your_dev_ios_app_id
FIREBASE_APP_ID_ANDROID=your_dev_android_app_id

# Supabase Configuration - Development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
```

### Staging (.env.staging)

```
# Staging Environment Configuration

# App Settings
APP_NAME=Motorove Beta
APP_ENV=staging
APP_VERSION=1.0.0
APP_BUILD_NUMBER=1
APP_VERSION_CODE=1
APP_BUNDLE_ID=com.motorove.staging

# API Settings
API_URL=https://api.staging.motorove.app
API_TIMEOUT=15000

# Debug Settings
DEBUG_MODE=false
ENABLE_LOGS=true

# Analytics
ANALYTICS_ENABLED=true
CRASH_REPORTING_ENABLED=true
SENTRY_DSN=

# Firebase Configuration - Staging
FIREBASE_API_KEY=your_staging_api_key
FIREBASE_AUTH_DOMAIN=your-staging-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-staging-project
FIREBASE_MESSAGING_SENDER_ID=your_staging_sender_id
FIREBASE_APP_ID_IOS=your_staging_ios_app_id
FIREBASE_APP_ID_ANDROID=your_staging_android_app_id

# Supabase Configuration - Staging
SUPABASE_URL=https://your-staging-project.supabase.co
SUPABASE_KEY=your_staging_supabase_anon_key
```

### Production (.env)

```
# Production Environment Configuration

# App Settings
APP_NAME=Motorove
APP_ENV=production
APP_VERSION=1.0.0
APP_BUILD_NUMBER=1
APP_VERSION_CODE=1
APP_BUNDLE_ID=com.motorove

# API Settings
API_URL=https://api.motorove.app
API_TIMEOUT=15000

# Debug Settings
DEBUG_MODE=false
ENABLE_LOGS=false

# Analytics
ANALYTICS_ENABLED=true
CRASH_REPORTING_ENABLED=true
SENTRY_DSN=your_production_sentry_dsn

# Firebase Configuration - Production
FIREBASE_API_KEY=your_production_api_key
FIREBASE_AUTH_DOMAIN=your-production-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-production-project
FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id
FIREBASE_APP_ID_IOS=your_production_ios_app_id
FIREBASE_APP_ID_ANDROID=your_production_android_app_id

# Supabase Configuration - Production
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_KEY=your_production_supabase_anon_key
```

## Using Environment Variables

In the application code, environment variables are accessed through the `AppConfig` object:

```typescript
import {AppConfig} from '@configs/appConfig';

console.log('Current environment:', AppConfig.APP_ENV);
console.log('API URL:', AppConfig.API_URL);
```

For Firebase configuration, use the `getFirebaseConfig` function:

```typescript
import {getFirebaseConfig} from '@configs/firebaseConfig';

const firebaseConfig = getFirebaseConfig();
console.log('Firebase project ID:', firebaseConfig.projectId);
```

For Supabase, the client is automatically initialized from environment variables:

```typescript
import {supabase} from '@configs/supabase';

// Supabase client is ready to use
const {data, error} = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});
```

## Important Notes

### Firebase iOS Setup

For iOS, Firebase requires native initialization in `AppDelegate.swift`. The app automatically calls `FirebaseApp.configure()` on startup. Make sure you have:

1. Added `GoogleService-Info.plist` to your iOS project (download from Firebase Console)
2. The plist file is added to the Xcode project target
3. Firebase SDK is properly installed via CocoaPods

### Supabase Credentials

Supabase credentials (`SUPABASE_URL` and `SUPABASE_KEY`) are required for authentication. If these are missing:

- The app will log a warning but continue to start
- Authentication features will not work until credentials are configured
- Make sure to use the **anon/public** key, not the service role key

## Running the App with Different Environments

Use the provided npm scripts to run the app with different environment configurations:

### Android

```bash
# Development
pnpm android:dev

# Staging
pnpm android:staging

# Production
pnpm android:prod
```

### iOS

```bash
# Development
pnpm ios:dev

# Staging
pnpm ios:staging

# Production
pnpm ios:prod
```
