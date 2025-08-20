import {useMutation} from '@apollo/client';
import {Platform} from 'react-native';
import * as DeviceInfo from 'react-native-device-info';
import {loggingService} from './logging.service';
import {showToast} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {CREATE_SUPPORT_REQUEST} from './graphql/support.graphql';
import {ICreateSupportRequest} from '@motorove/shared';

/**
 * Get device information for troubleshooting
 */
const getDeviceInfo = (): Record<string, string> => {
  try {
    const deviceInfo = {
      platform: Platform.OS.toString(),
      platformVersion: Platform.Version.toString(),
      brand: DeviceInfo.getBrand().toString(),
      model: DeviceInfo.getModel().toString(),
      appVersion: DeviceInfo.getVersion().toString(),
      buildNumber: DeviceInfo.getBuildNumber().toString(),
    };

    return deviceInfo;
  } catch (error) {
    loggingService.error('Error getting device info:', error);
    return {} as Record<string, string>;
  }
};

/**
 * Hook for creating a support request
 * @param onSuccess Optional callback function to be called on successful submission
 */
export const useCreateSupportRequest = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [createSupportRequestMutation, {loading, error}] = useMutation(
    CREATE_SUPPORT_REQUEST,
    {
      onCompleted: () => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.support.success_created_support_request'),
        });

        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error creating support request:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2:
            errorObj.message ||
            t('screens.support.error_creating_support_request'),
        });
      },
    },
  );

  const createSupportRequest = async (input: ICreateSupportRequest) => {
    try {
      const result = await createSupportRequestMutation({
        variables: {
          input: {
            ...input,
            deviceInfo: getDeviceInfo(),
          },
        },
      });

      return result.data?.createSupportRequest;
    } catch (err) {
      loggingService.error('Error in createSupportRequest:', err);
      return null;
    }
  };

  return {
    createSupportRequest,
    loading,
    error,
  };
};

export const SupportService = {
  useCreateSupportRequest,
};

export default SupportService;
