import {useMutation} from '@apollo/client';
import {loggingService} from './logging.service';
import {UPDATE_USER_SETTING} from './graphql/user-setting.graphql';
import {IUpdateUserSetting, IUserSetting} from '@motorove/shared';
import {useTranslation} from '@hooks/useTranslation';
import {showToast} from '@components';

export const useUpdateUserSetting = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [updateUserSettingMutation, {loading, error}] = useMutation(
    UPDATE_USER_SETTING,
    {
      onCompleted: _data => {
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error updating user setting:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2: errorObj.message || t('screens.userSetting.update_failed'),
        });
      },
    },
  );

  const updateUserSetting = async (input: IUpdateUserSetting) => {
    try {
      const result = await updateUserSettingMutation({
        variables: {
          input,
        },
      });
      return result.data?.updateUserSetting as IUserSetting;
    } catch (err) {
      loggingService.error('Error in updateUserSetting:', err);
      return null;
    }
  };

  return {
    updateUserSetting,
    loading,
    error,
  };
};
