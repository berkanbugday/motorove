import {useCallback} from 'react';
import {GraphQLFormattedError} from 'graphql';
import {graphQLErrorService} from '@services/graphql-error.service';

/**
 * Custom hook for handling GraphQL errors within React components
 * This is a wrapper around the graphQLErrorService that makes it usable in React components
 */
export const useGraphQLErrorHandler = () => {
  /**
   * Handle specific GraphQL error codes
   */
  const handleGraphQLError = useCallback(
    async (error: GraphQLFormattedError, options = {}) => {
      return graphQLErrorService.handleGraphQLError(error, options);
    },
    [],
  );

  /**
   * Create a wrapper for GraphQL operations that handles errors
   */
  const withGraphQLErrorHandling = useCallback(
    <T extends any[], R>(
      fn: (...args: T) => Promise<R>,
      options: {
        onSuccess?: (result: R) => void;
        successMessage?: string;
        fallbackErrorMessage?: string;
      } = {},
    ) => {
      return graphQLErrorService.withGraphQLErrorHandling(fn, options);
    },
    [],
  );

  return {
    handleGraphQLError,
    withGraphQLErrorHandling,
  };
};

export default useGraphQLErrorHandler;
