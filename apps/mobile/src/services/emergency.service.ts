import {useCallback, useState} from 'react';
import {useMutation, useQuery} from '@apollo/client';
import {showToast} from '@components/ToastMessage';
import {useTranslation} from '@hooks/useTranslation';
import {
  CREATE_EMERGENCY,
  GET_EMERGENCIES,
  GET_EMERGENCY,
  GET_MY_EMERGENCIES,
  REMOVE_EMERGENCY,
} from './graphql/emergency.graphql';
import {EmergencyType, IEmergency, ICreateEmergency} from '@motorove/shared';
import {loggingService} from './logging.service';

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

interface IEmergencyFilter {
  type?: EmergencyType;
}

// Hook for getting all emergencies within map viewport bounds
// @param bounds - Map viewport bounds (polygon)
// @param filters - Filter criteria for emergencies
// @param limit - Maximum number of emergencies to return (default: 100 on backend)
export const useGetEmergencies = (
  bounds?: IMapBounds,
  filters?: IEmergencyFilter,
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
  } = useQuery(GET_EMERGENCIES, {
    variables: {
      filter: {
        northEastLat: bounds?.northEast.latitude,
        northEastLng: bounds?.northEast.longitude,
        southWestLat: bounds?.southWest.latitude,
        southWestLng: bounds?.southWest.longitude,
        limit: limit,
        type: filters?.type,
      },
    },
    skip: shouldSkip,
    onError: errorObj => {
      loggingService.error('Error fetching emergencies in viewport:', errorObj);
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

          const prevEmergencies = prev?.emergencies || [];

          // Create a Set of existing emergency IDs to prevent duplicates
          const existingIds = new Set(
            prevEmergencies.map((emergency: any) => emergency.id),
          );

          // Filter out any emergencies that already exist
          const newEmergencies = fetchMoreResult.emergencies.filter(
            (emergency: any) => !existingIds.has(emergency.id),
          );

          return {
            emergencies: [...prevEmergencies, ...newEmergencies],
          };
        },
      });

      if (result.data.emergencies.length === 0) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more emergencies:', errorObj);
    }
  }, [data?.emergencies?.length, fetchMore, hasMore, loading]);

  return {
    emergencies: (data?.emergencies as IEmergency[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
  };
};

// Hook for getting a specific emergency
export const useGetEmergency = (id: string) => {
  const {data, loading, error, refetch} = useQuery(GET_EMERGENCY, {
    variables: {id},
    skip: !id,
    onError: errorObj => {
      loggingService.error('Error fetching emergency:', errorObj);
    },
  });

  return {
    emergency: data?.emergency as IEmergency | undefined,
    loading,
    error,
    refetch,
  };
};

// Hook for getting current user's emergencies
export const useGetMyEmergencies = () => {
  const [hasMore, setHasMore] = useState(true);
  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_MY_EMERGENCIES, {
    onError: errorObj => {
      loggingService.error('Error fetching my emergencies:', errorObj);
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

          const prevEmergencies = prev?.myEmergencies || [];
          // Create a Set of existing emergency IDs to prevent duplicates
          const existingIds = new Set(
            prevEmergencies.map((emergency: any) => emergency.id),
          );

          // Filter out any emergencies that already exist
          const newEmergencies = fetchMoreResult.myEmergencies.filter(
            (emergency: any) => !existingIds.has(emergency.id),
          );

          return {
            myEmergencies: [...prevEmergencies, ...newEmergencies],
          };
        },
      });

      if (result.data.myEmergencies.length === 0) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more emergencies:', errorObj);
    }
  }, [data?.myEmergencies?.length, fetchMore, hasMore, loading]);

  return {
    emergencies: (data?.myEmergencies as IEmergency[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
  };
};

// Hook for creating an emergency
export const useCreateEmergency = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [createEmergencyMutation, {loading, error}] = useMutation(
    CREATE_EMERGENCY,
    {
      onCompleted: () => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('components.emergencyBottomSheet.emergency_sent'),
        });
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error creating emergency:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2:
            errorObj.message || t('components.emergencyBottomSheet.send_error'),
        });
      },
      refetchQueries: ['GetEmergencies', 'GetMyEmergencies'],
    },
  );

  const createEmergency = useCallback(
    async (input: ICreateEmergency): Promise<IEmergency> => {
      try {
        const result = await createEmergencyMutation({
          variables: {input},
        });
        return result.data?.createEmergency;
      } catch (err) {
        loggingService.error('Error in createEmergency:', err);
        throw err;
      }
    },
    [createEmergencyMutation],
  );

  return {
    createEmergency,
    loading,
    error,
  };
};

// Hook for removing an emergency
export const useRemoveEmergency = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [removeEmergencyMutation, {loading, error}] = useMutation(
    REMOVE_EMERGENCY,
    {
      onCompleted: () => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('components.emergencyBottomSheet.emergency_removed'),
        });
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error removing emergency:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2:
            errorObj.message ||
            t('components.emergencyBottomSheet.remove_error'),
        });
      },
      refetchQueries: ['GetEmergencies', 'GetMyEmergencies'],
    },
  );

  const removeEmergency = useCallback(
    async (id: string) => {
      try {
        const result = await removeEmergencyMutation({
          variables: {id},
        });
        return result.data?.removeEmergency;
      } catch (err) {
        loggingService.error('Error in removeEmergency:', err);
        throw err;
      }
    },
    [removeEmergencyMutation],
  );

  return {
    removeEmergency,
    loading,
    error,
  };
};

// Export as EmergencyService object
export const EmergencyService = {
  useGetEmergency,
  useGetEmergencies,
  useGetMyEmergencies,
  useCreateEmergency,
  useRemoveEmergency,
};

export default EmergencyService;
