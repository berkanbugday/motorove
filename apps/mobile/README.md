This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

# Motorove Mobile App

## Fixing React Native Snap Carousel Issues

The project uses `react-native-snap-carousel` which is not fully compatible with newer versions of React Native because it uses the deprecated `ViewPropTypes`. We've implemented a fix for this using `deprecated-react-native-prop-types`.

### Automatic Fix

The fix should be automatically applied when running `npm install` or `pnpm install` with the patch-package system. If you encounter any issues, you can manually apply the fix.

### Manual Fix

If you encounter the error: `TypeError: Cannot read property 'style' of undefined, js engine: hermes`, follow these steps:

1. Make sure `deprecated-react-native-prop-types` is installed:

   ```
   pnpm add deprecated-react-native-prop-types
   ```

2. Modify the following files in the node_modules directory:

#### `node_modules/react-native-snap-carousel/src/carousel/Carousel.js`

- Change the import line:

  ```js
  // Replace this line
  import {
    Animated,
    Easing,
    FlatList,
    I18nManager,
    Platform,
    ScrollView,
    View,
    ViewPropTypes,
  } from 'react-native';

  // With these lines
  import {
    Animated,
    Easing,
    FlatList,
    I18nManager,
    Platform,
    ScrollView,
    View,
  } from 'react-native';
  import {ViewPropTypes} from 'deprecated-react-native-prop-types';
  ```

- Replace style prop types:

  ```js
  // Replace all occurrences of
  ViewPropTypes ? ViewPropTypes.style : View.propTypes.style;

  // With
  ViewPropTypes
    ? ViewPropTypes.style
    : PropTypes.oneOfType([PropTypes.object, PropTypes.array]);
  ```

#### `node_modules/react-native-snap-carousel/src/pagination/Pagination.js`

- Change the import line:

  ```js
  import {I18nManager, Platform, View} from 'react-native';
  import {ViewPropTypes} from 'deprecated-react-native-prop-types';
  ```

- Replace all style prop types similarly.

#### `node_modules/react-native-snap-carousel/src/pagination/PaginationDot.js`

- Update imports and replace style prop types.

#### `node_modules/react-native-snap-carousel/src/parallaximage/ParallaxImage.js`

- Update imports and replace style prop types.

### Alternative Solutions

If you continue to face issues, consider using a more modern carousel library like:

- `react-native-reanimated-carousel`
- `react-native-pager-view`
