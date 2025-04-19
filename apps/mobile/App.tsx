/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {StatusBar, Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import WelcomeScreen from './src/screens/welcome/WelcomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Placeholder for Home screen
function HomeScreen() {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Home Screen</Text>
    </View>
  );
}

// Create stack navigator
const Stack = createStackNavigator();

function App(): React.JSX.Element {
  const [isFirstTime, setIsFirstTime] = React.useState<boolean | null>(true);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function checkFirstTime() {
      try {
        const value = await AsyncStorage.getItem('isFirstTime');
        setIsFirstTime(value === null);
      } catch (error) {
        console.error('Error checking first time status:', error);
        setIsFirstTime(true);
      } finally {
        setIsLoading(false);
      }
    }

    checkFirstTime();
  }, []);

  if (isLoading) {
    // You could add a splash screen here
    return <View style={{flex: 1, backgroundColor: '#FFFFFF'}} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {1 == 1 ? (
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
          ) : (
            <Stack.Screen name="Home" component={HomeScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
