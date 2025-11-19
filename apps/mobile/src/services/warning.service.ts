import {useCallback, useState} from 'react';
import {useMutation, useQuery} from '@apollo/client';
import {showToast} from '@components/ToastMessage';
import {useTranslation} from '@hooks/useTranslation';
import {
  CREATE_WARNING,
  GET_WARNINGS,
  GET_WARNING,
  GET_MY_WARNINGS,
  REMOVE_WARNING,
} from './graphql/warning.graphql';
import {WarningType, IWarning, ICreateWarning} from '@motorove/shared';
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

interface IWarningFilter {
  type?: WarningType;
}

// Hook for getting all warnings within map viewport bounds
// @param bounds - Map viewport bounds (polygon)
// @param filters - Filter criteria for warnings
// @param limit - Maximum number of warnings to return (default: 100 on backend)
export const useGetWarnings = (
  bounds?: IMapBounds,
  filters?: IWarningFilter,
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
  } = useQuery(GET_WARNINGS, {
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
      loggingService.error('Error fetching warnings in viewport:', errorObj);
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

          const prevWarnings = prev?.warnings || [];

          // Create a Set of existing warning IDs to prevent duplicates
          const existingIds = new Set(
            prevWarnings.map((warning: any) => warning.id),
          );

          // Filter out any warnings that already exist
          const newWarnings = fetchMoreResult.warnings.filter(
            (warning: any) => !existingIds.has(warning.id),
          );

          return {
            warnings: [...prevWarnings, ...newWarnings],
          };
        },
      });

      if (result.data.warnings.length === 0) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more warnings:', errorObj);
    }
  }, [data?.warnings?.length, fetchMore, hasMore, loading]);

  return {
    warnings: (data?.warnings as IWarning[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
  };
};

// Hook for getting a specific warning
export const useGetWarning = (id?: string) => {
  const {data, loading, error, refetch} = useQuery(GET_WARNING, {
    variables: {id},
    skip: !id,
    onError: errorObj => {
      loggingService.error('Error fetching warning:', errorObj);
    },
  });

  return {
    warning: data?.warning as IWarning | undefined,
    loading,
    error,
    refetch,
  };
};

// Hook for getting current user's warnings
export const useGetMyWarnings = () => {
  const [hasMore, setHasMore] = useState(true);
  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_MY_WARNINGS, {
    onError: errorObj => {
      loggingService.error('Error fetching my warnings:', errorObj);
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

          const prevWarnings = prev?.myWarnings || [];
          // Create a Set of existing warning IDs to prevent duplicates
          const existingIds = new Set(
            prevWarnings.map((warning: any) => warning.id),
          );

          // Filter out any warnings that already exist
          const newWarnings = fetchMoreResult.myWarnings.filter(
            (warning: any) => !existingIds.has(warning.id),
          );

          return {
            myWarnings: [...prevWarnings, ...newWarnings],
          };
        },
      });

      if (result.data.myWarnings.length === 0) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more warnings:', errorObj);
    }
  }, [data?.myWarnings?.length, fetchMore, hasMore, loading]);

  return {
    warnings: (data?.myWarnings as IWarning[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
  };
};

// Hook for creating a warning
export const useCreateWarning = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [createWarningMutation, {loading, error}] = useMutation(
    CREATE_WARNING,
    {
      onCompleted: () => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('components.warningBottomSheet.warning_sent'),
        });
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error creating warning:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2:
            errorObj.message || t('components.warningBottomSheet.send_error'),
        });
      },
      refetchQueries: ['GetWarnings', 'GetMyWarnings'],
    },
  );

  const createWarning = useCallback(
    async (input: ICreateWarning): Promise<IWarning> => {
      try {
        const result = await createWarningMutation({
          variables: {input},
        });
        return result.data?.createWarning;
      } catch (err) {
        loggingService.error('Error in createWarning:', err);
        throw err;
      }
    },
    [createWarningMutation],
  );

  return {
    createWarning,
    loading,
    error,
  };
};

// Hook for removing a warning
export const useRemoveWarning = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [removeWarningMutation, {loading, error}] = useMutation(
    REMOVE_WARNING,
    {
      onCompleted: () => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('components.warningBottomSheet.warning_removed'),
        });
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error removing warning:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2:
            errorObj.message || t('components.warningBottomSheet.remove_error'),
        });
      },
      refetchQueries: ['GetWarnings', 'GetMyWarnings'],
    },
  );

  const removeWarning = useCallback(
    async (id: string) => {
      try {
        const result = await removeWarningMutation({
          variables: {id},
        });
        return result.data?.removeWarning;
      } catch (err) {
        loggingService.error('Error in removeWarning:', err);
        throw err;
      }
    },
    [removeWarningMutation],
  );

  return {
    removeWarning,
    loading,
    error,
  };
};

// Export as WarningService object
export const WarningService = {
  useGetWarning,
  useGetWarnings,
  useGetMyWarnings,
  useCreateWarning,
  useRemoveWarning,
};

export default WarningService;
