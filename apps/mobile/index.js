/**
 * @format
 */

// Import polyfills first to ensure Node.js core modules are available
// Use require to ensure synchronous loading before any other imports
require('./src/polyfills');

import {AppRegistry} from 'react-native';
import {enableScreens} from 'react-native-screens';
import App from './App';
import {name as appName} from './app.json';

// Enable native screens implementation for better performance
enableScreens();

AppRegistry.registerComponent(appName, () => App);
