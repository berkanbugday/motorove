# Motorove Mobile App

React Native mobile application for the Motorove motorcycle community platform.

## 🏍️ Features

- **Social Feed**: Share posts, photos, and experiences with the community
- **Groups**: Create and join riding groups with privacy settings
- **Events**: Organize and participate in group rides and meetups
- **Map**: Discover businesses, warnings, and emergencies nearby
- **Notifications**: Real-time push notifications for social interactions
- **Multi-language**: English and Turkish support
- **30-day Sessions**: Stay logged in for a month

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.6.0
- Xcode (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS)

### Installation

```bash
# From monorepo root
pnpm install

# Build shared package first
pnpm build:shared

# Navigate to mobile app
cd apps/mobile

# Install iOS dependencies
cd ios && bundle install && bundle exec pod install && cd ..
```

### Running the App

```bash
# Start Metro bundler
pnpm dev

# Run on Android (development)
pnpm android:dev

# Run on iOS (development)
pnpm ios:dev
```

## 🛠️ Available Scripts

### Development

| Command                | Description              |
| ---------------------- | ------------------------ |
| `pnpm dev`             | Start Metro bundler      |
| `pnpm android:dev`     | Run on Android (dev)     |
| `pnpm android:staging` | Run on Android (staging) |
| `pnpm android:prod`    | Run on Android (prod)    |
| `pnpm ios:dev`         | Run on iOS (dev)         |
| `pnpm ios:staging`     | Run on iOS (staging)     |
| `pnpm ios:prod`        | Run on iOS (prod)        |

### Build

| Command                        | Description                   |
| ------------------------------ | ----------------------------- |
| `pnpm build:android:dev`       | Build Android APK (dev)       |
| `pnpm build:android:staging`   | Build Android APK (staging)   |
| `pnpm build:android:prod`      | Build Android APK (prod)      |
| `pnpm android:release:dev`     | Build & run release (dev)     |
| `pnpm android:release:staging` | Build & run release (staging) |
| `pnpm android:release:prod`    | Build & run release (prod)    |

### Utilities

| Command            | Description              |
| ------------------ | ------------------------ |
| `pnpm clear-cache` | Clear Metro cache        |
| `pnpm start:clean` | Start with cache cleared |
| `pnpm lint`        | Run ESLint               |
| `pnpm test`        | Run Jest tests           |

## 🏗️ Project Structure

```
apps/mobile/
├── src/
│   ├── assets/           # Images, fonts, animations
│   ├── components/       # Reusable UI components
│   ├── configs/          # App configuration
│   ├── constants/        # App constants
│   ├── contexts/         # React contexts (Auth, Theme, Language)
│   ├── hooks/            # Custom React hooks
│   ├── i18n/             # Internationalization (EN, TR)
│   ├── navigation/       # React Navigation setup
│   ├── screens/          # App screens
│   ├── services/         # API services & GraphQL
│   ├── theme/            # Styling & theming
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── android/              # Android native code
├── ios/                  # iOS native code
├── fastlane/             # Fastlane deployment
└── package.json
```

## 📱 Screens

| Screen            | Description                       |
| ----------------- | --------------------------------- |
| **Auth**          | Sign in, sign up, password reset  |
| **Home**          | Social feed with posts            |
| **Map**           | Businesses, warnings, emergencies |
| **Events**        | Event listing and details         |
| **Groups**        | Group listing and management      |
| **Profile**       | User profile and settings         |
| **Notifications** | Push notification history         |

## 🔧 Tech Stack

| Category       | Technology                      |
| -------------- | ------------------------------- |
| **Framework**  | React Native 0.79               |
| **Language**   | TypeScript                      |
| **Navigation** | React Navigation 7              |
| **State**      | React Context, Apollo Client    |
| **API**        | GraphQL (Apollo Client)         |
| **Maps**       | react-native-maps               |
| **Auth**       | Supabase, Firebase              |
| **Push**       | Firebase Cloud Messaging        |
| **Analytics**  | Firebase Analytics              |
| **Crash**      | Firebase Crashlytics, Sentry    |
| **i18n**       | i18next, react-i18next          |
| **Forms**      | React Hook Form, Zod            |
| **Storage**    | Encrypted Storage, AsyncStorage |

## 🔐 Environment Configuration

Create environment files in the mobile directory:

```bash
# .env.dev - Development
API_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SENTRY_DSN=your-sentry-dsn

# .env.staging - Staging
# .env - Production
```

## 📚 Documentation

- **[src/README.md](./src/README.md)** - Import aliases guide
- **[src/services/README.md](./src/services/README.md)** - Services documentation
- **[src/services/README-FIREBASE.md](./docs/README-FIREBASE.md)** - Firebase setup
- **[src/docs/README-ENVIRONMENTS.md](./docs/README-ENVIRONMENTS.md)** - Environment setup
- **[src/docs/ANIMATED_MAP.md](./docs/ANIMATED_MAP.md)** - Animated Map Implementation details

## 🐛 Troubleshooting

### Common Issues

#### Metro Cache Issues

```bash
# Clear Metro cache
pnpm clear-cache

# Or start with clean cache
pnpm start:clean
```

#### iOS Build Issues

```bash
cd ios
rm -rf Pods Podfile.lock
bundle exec pod install --repo-update
cd ..
```

#### Android Build Issues

```bash
cd android
./gradlew clean
cd ..
```

#### Map Marker Flickering (Android)

The project includes automatic fixes for react-native-maps marker flickering. These are applied via scripts in the `android:dev` command.

### React Native Snap Carousel

The project uses `react-native-snap-carousel` with `deprecated-react-native-prop-types` for compatibility. Patches are automatically applied via `patch-package`.

### iOS Image Display

Ensure `Info.plist` has proper permissions:

```xml
<key>NSAppTransportSecurity</key>
<dict>
   <key>NSAllowsArbitraryLoads</key>
   <true/>
</dict>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photo library to let you share images</string>
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to let you take photos</string>
```

## 📦 Monorepo Integration

This app is part of the Motorove monorepo:

```
motorove/
├── apps/
│   ├── backend/          # NestJS GraphQL API
│   ├── mobile/           # This project
│   └── landing/          # Next.js landing page
└── shared/               # Shared types & interfaces
```

The mobile app imports shared types from `@motorove/shared`.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `pnpm lint`
4. Run tests: `pnpm test`
5. Submit a pull request

## 📄 License

UNLICENSED - Private repository

---

**Made with ❤️ for the motorcycle community**
