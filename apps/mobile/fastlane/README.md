fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

### bump_version

```sh
[bundle exec] fastlane bump_version
```

Bump build numbers on both platforms

----


## iOS

### ios build

```sh
[bundle exec] fastlane ios build
```

Build the iOS application for specified environment

### ios release_appstore

```sh
[bundle exec] fastlane ios release_appstore
```

Release to App Store Connect

### ios deploy_testflight

```sh
[bundle exec] fastlane ios deploy_testflight
```

Deploy a beta build to TestFlight

### ios deploy_firebase

```sh
[bundle exec] fastlane ios deploy_firebase
```

Deploy a beta build to Firebase App Distribution

----


## Android

### android build

```sh
[bundle exec] fastlane android build
```

Build the Android application for specified environment

### android deploy_play_prod

```sh
[bundle exec] fastlane android deploy_play_prod
```

Deploy a production build to Google Play Production track

### android deploy_play_beta

```sh
[bundle exec] fastlane android deploy_play_beta
```

Deploy a beta build to Google Play Beta track

### android deploy_firebase

```sh
[bundle exec] fastlane android deploy_firebase
```

Deploy a beta build to Firebase App Distribution

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
