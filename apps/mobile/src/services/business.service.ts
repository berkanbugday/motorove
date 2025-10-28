import {useQuery} from '@apollo/client';
import {
  GET_BUSINESSES,
  GET_BUSINESS,
  SEARCH_BUSINESSES,
} from './graphql/business.graphql';
import {IBusiness, IBusinessFilter} from '@motorove/shared';
import {loggingService} from './logging.service';
import {useState, useCallback} from 'react';

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

// Define map bounds interface for viewport polygon
interface IMapBounds {
  northEast: {
    latitude: number;
    longitude: number;
  };
  southWest: {
    latitude: number;
    longitude: number;
  };
}

// Hook for getting all businesses within map viewport bounds
// @param bounds - Map viewport bounds (polygon)
// @param filters - Filter criteria for businesses
// @param limit - Maximum number of businesses to return (default: 100 on backend)
export const useGetBusinesses = (
  bounds?: IMapBounds,
  filters?: IBusinessFilter,
  limit?: number,
) => {
  const [hasMore, setHasMore] = useState(true);

  // Skip query if no valid bounds provided
  const shouldSkip =
    !bounds ||
    !bounds.northEast ||
    !bounds.southWest ||
    isNaN(bounds.northEast.latitude) ||
    isNaN(bounds.northEast.longitude) ||
    isNaN(bounds.southWest.latitude) ||
    isNaN(bounds.southWest.longitude);

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_BUSINESSES, {
    variables: {
      filter: {
        northEastLat: bounds?.northEast.latitude,
        northEastLng: bounds?.northEast.longitude,
        southWestLat: bounds?.southWest.latitude,
        southWestLng: bounds?.southWest.longitude,
        limit: limit, // Optional limit for performance optimization
        categories: filters?.categories,
        minRating: filters?.minRating,
        searchQuery: filters?.searchQuery,
        isOpen: filters?.isOpen,
        isOpen24h: filters?.isOpen24h,
      },
    },
    skip: shouldSkip,
    onError: errorObj => {
      loggingService.error('Error fetching businesses in viewport:', errorObj);
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

          const prevBusinesses = prev?.businesses || [];

          // Create a Set of existing business IDs to prevent duplicates
          const existingIds = new Set(
            prevBusinesses.map((business: any) => business.id),
          );

          // Filter out any businesses that already exist
          const newBusinesses = fetchMoreResult.businesses.filter(
            (business: any) => !existingIds.has(business.id),
          );

          return {
            businesses: [...prevBusinesses, ...newBusinesses],
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

  return {
    businesses: (data?.businesses as IBusiness[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
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

          const prevBusinesses = prev?.businesses || [];
          // Create a Set of existing business IDs to prevent duplicates
          const existingIds = new Set(
            prevBusinesses.map((business: any) => business.id),
          );

          // Filter out any businesses that already exist
          const newBusinesses = fetchMoreResult.businesses.filter(
            (business: any) => !existingIds.has(business.id),
          );

          return {
            businesses: [...prevBusinesses, ...newBusinesses],
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
