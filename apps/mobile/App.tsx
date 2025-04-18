import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';

function App(): React.ReactElement {
  return <SafeAreaProvider></SafeAreaProvider>;
}

export default App;
