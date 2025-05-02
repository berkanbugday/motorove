# GraphQL Error Handling System

This document explains the GraphQL error handling system implemented in the mobile application.

## Overview

The error handling system consists of several components working together:

1. **Apollo Client Error Link**: Intercepts GraphQL errors at the network level
2. **useGraphQLErrorHandler Hook**: Provides specialized handling for GraphQL errors in components
3. **Error Utilities**: Converts technical error messages to user-friendly messages
4. **Toast Notifications**: Displays user-friendly error messages to the user

## Key Features

- **Automatic Token Refresh**: Automatically refreshes the authentication token when it expires
- **Error Classification**: Categorizes errors by type (authentication, validation, network, etc.)
- **User-Friendly Messages**: Converts technical error messages to user-friendly messages
- **Consistent Handling**: Provides a consistent approach to handling errors across the app
- **Error Logging**: Logs errors to the console and Sentry for monitoring
- **Network Detection**: Handles errors differently based on network connectivity

## Components

### 1. Apollo Client Error Link

Located in `src/configs/apolloClientConfig.ts`, the error link intercepts GraphQL errors at the network level before they reach components. It:

- Logs errors to the console and Sentry
- Automatically refreshes the authentication token when it expires
- Retries failed operations after token refresh
- Checks network connectivity to distinguish between offline and server errors

### 2. useGraphQLErrorHandler Hook

Located in `src/hooks/useGraphQLErrorHandler.ts`, this hook provides specialized handling for GraphQL errors in components:

- Handles specific GraphQL error codes with appropriate responses
- Provides utility methods for wrapping GraphQL operations with error handling
- Integrates with the existing error handling system

### 3. Error Utilities

Located in `src/utils/errorUtils.ts`, these utilities convert technical error messages to user-friendly messages:

- Extracts meaningful information from different types of errors
- Humanizes error messages to make them more understandable
- Provides fallback messages when no specific message is available

## Usage

### Basic Query Error Handling

```tsx
import {useQuery, gql} from '@apollo/client';
import {useGraphQLErrorHandler} from '../hooks/useGraphQLErrorHandler';

const MY_QUERY = gql`...`;

const MyComponent = () => {
  const {handleGraphQLError} = useGraphQLErrorHandler();

  const {data, loading} = useQuery(MY_QUERY, {
    onError: error => {
      // Will handle the error appropriately based on error code
      handleGraphQLError(error);
    },
  });

  // Rest of component...
};
```

### Mutation Error Handling

```tsx
import {useMutation, gql} from '@apollo/client';
import {useGraphQLErrorHandler} from '../hooks/useGraphQLErrorHandler';

const MY_MUTATION = gql`...`;

const MyComponent = () => {
  const {withGraphQLErrorHandling} = useGraphQLErrorHandler();

  const [mutate] = useMutation(MY_MUTATION);

  // Wrap the mutation execution with error handling
  const handleSubmit = withGraphQLErrorHandling(
    async variables => {
      const {data} = await mutate({variables});
      return data;
    },
    {
      successMessage: 'Operation completed successfully!',
      fallbackErrorMessage: 'Could not complete the operation',
    },
  );

  // Now use handleSubmit in your component
  // ...
};
```

## Complete Example

See `src/examples/GraphQLErrorHandlingExample.tsx` for a complete example of how to use the GraphQL error handling system.

## Error Codes

The system handles the following GraphQL error codes:

- `UNAUTHENTICATED`: Authentication errors (expired tokens, invalid credentials)
- `FORBIDDEN`: Authorization errors (insufficient permissions)
- `BAD_USER_INPUT`: Validation errors (invalid input)
- `INTERNAL_SERVER_ERROR`: Server errors (unexpected errors on the server)
- `PERSISTED_QUERY_NOT_FOUND`, `PERSISTED_QUERY_NOT_SUPPORTED`: Apollo-specific errors

## Best Practices

1. Always use the `useGraphQLErrorHandler` hook for handling GraphQL errors
2. Provide fallback error messages for better user experience
3. Add success messages for successful operations
4. Handle network errors appropriately
5. Consider implementing retry logic for intermittent failures
