import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useMutation, useQuery, gql} from '@apollo/client';
import {useGraphQLErrorHandler} from '../hooks/useGraphQLErrorHandler';

// Example GraphQL operations
const EXAMPLE_QUERY = gql`
  query GetUserProfile {
    currentUser {
      id
      username
      email
    }
  }
`;

const EXAMPLE_MUTATION = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      username
      email
    }
  }
`;

const GraphQLErrorHandlingExample = () => {
  const [userData, setUserData] = useState<any>(null);
  const {handleGraphQLError, withGraphQLErrorHandling} =
    useGraphQLErrorHandler();

  // Set up the query with error handling
  const {loading, refetch} = useQuery(EXAMPLE_QUERY, {
    onCompleted: data => {
      setUserData(data.currentUser);
    },
    onError: error => {
      // Use our custom GraphQL error handler
      handleGraphQLError(error);
    },
    fetchPolicy: 'network-only',
  });

  // Set up a mutation with error handling
  const [updateProfile, {loading: updating}] = useMutation(EXAMPLE_MUTATION);

  // Wrap the mutation with our error handler
  const handleUpdateProfile = withGraphQLErrorHandling(
    async (newUsername: string) => {
      const {data} = await updateProfile({
        variables: {
          input: {
            username: newUsername,
          },
        },
      });

      setUserData(data.updateUserProfile);
      return data;
    },
    {
      successMessage: 'Profile updated successfully!',
      fallbackErrorMessage: 'Could not update profile',
    },
  );

  // Load data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await refetch();
      } catch (error) {
        // Error already handled by onError callback
      }
    };

    fetchData();
  }, [refetch]);

  // Example of refreshing data with error handling
  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      // Error already handled by onError callback
    }
  };

  // Example of invoking a mutation with error handling
  const handleUpdateUsername = async () => {
    await handleUpdateProfile('new_username');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GraphQL Error Handling Example</Text>

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : userData ? (
        <View style={styles.profileCard}>
          <Text style={styles.label}>Username:</Text>
          <Text style={styles.value}>{userData.username}</Text>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{userData.email}</Text>
        </View>
      ) : (
        <Text style={styles.errorText}>No user data available</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleRefresh}
          disabled={loading}>
          <Text style={styles.buttonText}>Refresh Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdateUsername}
          disabled={updating}>
          <Text style={styles.buttonText}>
            {updating ? 'Updating...' : 'Update Username'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  loading: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flex: 0.48,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GraphQLErrorHandlingExample;
