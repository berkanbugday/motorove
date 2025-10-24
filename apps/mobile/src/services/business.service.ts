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
// @param limit - Maximum number of businesses to return (default: 300 on backend)
export const useGetBusinesses = (bounds?: IMapBounds, limit?: number) => {
  const [hasMore, setHasMore] = useState(true);
  const [currentBounds, setCurrentBounds] = useState<IMapBounds | undefined>(
    bounds,
  );

  // Update bounds when prop changes
  useEffect(() => {
    setCurrentBounds(bounds);
  }, [bounds]);

  // Skip query if no valid bounds provided
  const shouldSkip =
    !currentBounds ||
    !currentBounds.northEast ||
    !currentBounds.southWest ||
    isNaN(currentBounds.northEast.latitude) ||
    isNaN(currentBounds.northEast.longitude) ||
    isNaN(currentBounds.southWest.latitude) ||
    isNaN(currentBounds.southWest.longitude);

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_BUSINESSES, {
    variables: {
      filter: {
        northEastLat: currentBounds?.northEast.latitude,
        northEastLng: currentBounds?.northEast.longitude,
        southWestLat: currentBounds?.southWest.latitude,
        southWestLng: currentBounds?.southWest.longitude,
        limit: limit, // Optional limit for performance optimization
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

  // Update bounds and refetch
  const updateBounds = useCallback(
    (newBounds: IMapBounds) => {
      setCurrentBounds(newBounds);
      setHasMore(true);
    },
    [],
  );

  return {
    businesses: (data?.businesses as IBusiness[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
    bounds: currentBounds,
    updateBounds,
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
