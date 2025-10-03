# Motorove Fastlane Documentation

This document describes the available Fastlane lanes for building and deploying the Motorove mobile application.

## Installation

### Prerequisites

Make sure you have the following installed:

```sh
# Install Xcode command line tools
xcode-select --install

# Install Bundler (if not already installed)
gem install bundler

# Install dependencies
bundle install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

## Environment Configuration

The project supports three environments:
- **dev** - Development environment
- **staging** - Staging/beta environment  
- **prod** - Production environment

Environment-specific configuration files are located in `fastlane/.env.*`:
- `.env.dev` - Development configuration
- `.env.staging` - Staging configuration
- `.env` - Production configuration

## Available Actions

### bump_version

```sh
bundle exec fastlane bump_version
```

Bump build numbers on both iOS and Android platforms.

----

## iOS

### ios build

Build the iOS application for a specified environment.

```sh
# Development build
bundle exec fastlane ios build env:dev

# Staging build
bundle exec fastlane ios build env:staging

# Production build
bundle exec fastlane ios build env:prod
```

**Parameters:**
- `env` - Environment to build for (default: `dev`)

### ios deploy_testflight

Deploy a beta build to TestFlight for internal/external testing.

```sh
# Deploy staging build to TestFlight
bundle exec fastlane ios deploy_testflight env:staging

# Deploy production build to TestFlight
bundle exec fastlane ios deploy_testflight env:prod
```

**Parameters:**
- `env` - Environment to deploy (default: `staging`)

**Requirements:**
- Apple ID credentials configured in `.env.*`
- App-specific password set in `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD`
- Valid provisioning profiles via match

### ios deploy_firebase

Deploy a beta build to Firebase App Distribution.

```sh
# Deploy dev build to Firebase
bundle exec fastlane ios deploy_firebase env:dev

# Deploy staging build to Firebase
bundle exec fastlane ios deploy_firebase env:staging
```

**Parameters:**
- `env` - Environment to deploy (default: `dev`)
- `notes` - Release notes (optional)

**Example with release notes:**
```sh
bundle exec fastlane ios deploy_firebase env:staging notes:"Bug fixes and improvements"
```

### ios release_appstore

Release to App Store Connect for review and production release.

```sh
bundle exec fastlane ios release_appstore env:prod
```

**Parameters:**
- `env` - Environment to release (default: `prod`)

----

## Android

### android build

Build the Android application for a specified environment.

```sh
# Development build
bundle exec fastlane android build env:dev

# Staging build
bundle exec fastlane android build env:staging

# Production build
bundle exec fastlane android build env:prod
```

**Parameters:**
- `env` - Environment to build for (default: `dev`)

### android deploy_firebase

Deploy a beta build to Firebase App Distribution.

```sh
# Deploy dev build to Firebase
bundle exec fastlane android deploy_firebase env:dev

# Deploy staging build to Firebase
bundle exec fastlane android deploy_firebase env:staging
```

**Parameters:**
- `env` - Environment to deploy (default: `dev`)
- `notes` - Release notes (optional)

### android deploy_play_beta

Deploy a beta build to Google Play Beta track.

```sh
bundle exec fastlane android deploy_play_beta env:staging
```

**Parameters:**
- `env` - Environment to deploy (default: `staging`)

### android release_playstore

Release to Google Play Store for production.

```sh
bundle exec fastlane android release_playstore env:prod
```

**Parameters:**
- `env` - Environment to release (default: `prod`)

----

## Troubleshooting

### iOS Code Signing Issues

If you encounter code signing errors:

```sh
# Update provisioning profiles
bundle exec fastlane match appstore --force_for_new_devices
```

### Version Conflicts

Ensure version numbers in `.env.*` files follow semantic versioning (e.g., `1.0.0`).

### TestFlight Upload Errors

- Verify your app-specific password is correctly set in `.env.staging`
- Check that your Apple ID has the necessary permissions
- Ensure the app icon has no alpha channel (transparency)

### Common Issues

1. **Build failures**: Clean the project and rebuild
   ```sh
   cd ios && pod deintegrate && pod install && cd ..
   ```

2. **Environment not loading**: Check that `.env.*` files exist in the `fastlane/` directory

3. **Match errors**: Ensure you have access to the certificates repository and correct passphrase

----

## More Information

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
