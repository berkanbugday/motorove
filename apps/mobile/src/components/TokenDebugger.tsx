import React, {useCallback} from 'react';
import {View, Text, Button, StyleSheet, ScrollView} from 'react-native';
import authService from '@services/auth.service';
import {loggingService} from '@services/logging.service';
import {apolloClient} from '@configs/apolloClientConfig';
import {gql} from '@apollo/client';

// Test query to verify token works
const TEST_QUERY = gql`
  query TestQuery {
    __typename
  }
`;

const TokenDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = React.useState<string>('');

  const addToDebugInfo = useCallback((message: string) => {
    setDebugInfo(prev => `${prev}\n\n${message}`);
  }, []);

  const checkTokenStatus = useCallback(async () => {
    try {
      setDebugInfo('Checking token status...');
      await authService.debugTokenStatus();
      addToDebugInfo('Debug check completed. Check console logs for details.');
    } catch (error) {
      addToDebugInfo(
        `Error checking token: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }, [addToDebugInfo]);

  const testApiCall = useCallback(async () => {
    try {
      addToDebugInfo('Testing API call with current token...');
      const result = await apolloClient.query({
        query: TEST_QUERY,
        fetchPolicy: 'network-only',
      });

      addToDebugInfo(`API call successful: ${JSON.stringify(result)}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      loggingService.error('API test call failed:', error);
      addToDebugInfo(`API call failed: ${errorMessage}`);
    }
  }, [addToDebugInfo]);

  const forceSignOut = useCallback(async () => {
    try {
      addToDebugInfo('Signing out to reset tokens...');
      await authService.signOut();
      addToDebugInfo('Sign out successful');
    } catch (error) {
      addToDebugInfo(
        `Error signing out: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }, [addToDebugInfo]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Token Debugger</Text>
      <View style={styles.buttonContainer}>
        <Button title="Check Token Status" onPress={checkTokenStatus} />
        <Button title="Test API Call" onPress={testApiCall} />
        <Button title="Force Sign Out" onPress={forceSignOut} />
      </View>
      <ScrollView style={styles.logContainer}>
        <Text style={styles.logText}>
          {debugInfo || 'Press a button to start debugging'}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 4,
  },
  logText: {
    fontFamily: 'monospace',
  },
});

export default TokenDebugger;
