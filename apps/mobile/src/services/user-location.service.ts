import {useMutation} from '@apollo/client';
import {loggingService} from './logging.service';
import {UPDATE_USER_LOCATION} from './graphql/user-location.graphql';
import {showToast} from '@components';
import {useTranslation} from '@hooks/useTranslation';

export interface LocationUpdate {
  latitude: number;
  longitude: number;
}

// Hook for updating user location
export const useUpdateUserLocation = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [updateLocationMutation, {loading, error}] = useMutation(
    UPDATE_USER_LOCATION,
    {
      onCompleted: () => {
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error updating user location:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2: errorObj.message || 'Failed to update location',
        });
      },
    },
  );

  const updateUserLocation = async (location: LocationUpdate) => {
    try {
      // Validate location data before sending
      if (
        location.latitude == null ||
        location.longitude == null ||
        isNaN(location.latitude) ||
        isNaN(location.longitude)
      ) {
        loggingService.warning(
          'Invalid location data, skipping update:',
          location,
        );
        return null;
      }

      // Ensure coordinates are within valid ranges
      if (
        location.latitude < -90 ||
        location.latitude > 90 ||
        location.longitude < -180 ||
        location.longitude > 180
      ) {
        loggingService.warning(
          'Location coordinates out of range, skipping update:',
          location,
        );
        return null;
      }

      // Prepare input with validated values
      const input: any = {
        latitude: location.latitude,
        longitude: location.longitude,
      };

      const result = await updateLocationMutation({
        variables: {
          input,
        },
      });

      loggingService.info(
        `Location updated: (${location.latitude.toFixed(
          6,
        )}, ${location.longitude.toFixed(6)})`,
      );

      return result.data?.updateUserLocation;
    } catch (err) {
      loggingService.error('Error in updateUserLocation:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    updateUserLocation,
    loading,
    error,
  };
};

// Export as UserLocationService object
export const UserLocationService = {
  useUpdateUserLocation,
};

export default UserLocationService;
