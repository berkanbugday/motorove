import {useQuery} from '@apollo/client';
import {
  GET_BUSINESSES,
  GET_BUSINESS,
  SEARCH_BUSINESSES,
} from './graphql/business.graphql';
import {IBusiness} from '@motorove/shared';
import {loggingService} from './logging.service';
import {useState, useCallback, useEffect} from 'react';

// Hook for getting a specific business
export const useGetBusiness = (id: string) => {
  const {data, loading, error, refetch} = useQuery(GET_BUSINESS, {
    variables: {id},
    skip: !id,
    onError: errorObj => {
      loggingService.error('Error fetching business:', errorObj);
    },
  });

  return {
    business: data?.business as IBusiness | undefined,
    loading,
    error,
    refetch,
  };
};

// Define filter interface for businesses
interface IFilterBusiness {
  mainCategory?: string;
  subCategories?: string[];
}

// Hook for getting all businesses
export const useGetBusinesses = () => {
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<IFilterBusiness>({
    mainCategory: undefined,
    subCategories: [],
  });

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_BUSINESSES, {
    onError: errorObj => {
      loggingService.error('Error fetching all businesses:', errorObj);
    },
  });

  // Wrap the original refetch to reset hasMore state
  const refetch = useCallback(async () => {
    setHasMore(true);
    return await originalRefetch();
  }, [originalRefetch]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) {
      return;
    }

    try {
      const result = await fetchMore({
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }

          // Create a Set of existing business IDs to prevent duplicates
          const existingIds = new Set(prev.businesses.map((business: any) => business.id));

          // Filter out any businesses that already exist
          const newBusinesses = fetchMoreResult.businesses.filter(
            (business: any) => !existingIds.has(business.id),
          );

          return {
            businesses: [...prev.businesses, ...newBusinesses],
          };
        },
      });

      if (result.data.businesses.length === 0) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more businesses:', errorObj);
    }
  }, [data?.businesses?.length, fetchMore, hasMore, loading]);

  // Apply filters and reset pagination
  const applyFilters = useCallback((newFilters: IFilterBusiness) => {
    setFilters(newFilters);
    setHasMore(true);
  }, []);

  // Refetch when filters change
  useEffect(() => {
    originalRefetch();
  }, [filters, originalRefetch]);

  return {
    businesses: (data?.businesses as IBusiness[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
    filters,
    applyFilters,
  };
};

// Hook for searching businesses by name
export const useSearchBusinesses = (query: string) => {
  const [hasMore, setHasMore] = useState(true);
  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(SEARCH_BUSINESSES, {
    variables: {query},
    skip: !query || query.trim() === '',
    onError: errorObj => {
      loggingService.error('Error searching businesses:', errorObj);
    },
  });

  // Wrap the original refetch to reset hasMore state
  const refetch = useCallback(async () => {
    setHasMore(true);
    return await originalRefetch();
  }, [originalRefetch]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !query) {
      return;
    }

    try {
      const result = await fetchMore({
        variables: {query},
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }

          // Create a Set of existing business IDs to prevent duplicates
          const existingIds = new Set(prev.businesses.map((business: any) => business.id));

          // Filter out any businesses that already exist
          const newBusinesses = fetchMoreResult.businesses.filter(
            (business: any) => !existingIds.has(business.id),
          );

          return {
            businesses: [...prev.businesses, ...newBusinesses],
          };
        },
      });

      if (result.data.businesses.length === 0) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more search results:', errorObj);
    }
  }, [data?.businesses?.length, fetchMore, hasMore, loading, query]);

  return {
    businesses: (data?.businesses as IBusiness[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
  };
};

// Export as BusinessService object
export const BusinessService = {
  useGetBusiness,
  useGetBusinesses,
  useSearchBusinesses,
};

export default BusinessService;
