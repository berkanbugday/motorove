import {useCallback} from 'react';
import {showToast} from '@components/ToastMessage';
import {useTranslation} from '@hooks/useTranslation';

// Local types until shared package is updated
enum WarningType {
  OIL_ON_ROAD = 'OIL_ON_ROAD',
  RADAR = 'RADAR',
  POLICE_CHECKPOINT = 'POLICE_CHECKPOINT',
  ACCIDENT = 'ACCIDENT',
  ROAD_CONSTRUCTION = 'ROAD_CONSTRUCTION',
  POTHOLE = 'POTHOLE',
  DEBRIS_ON_ROAD = 'DEBRIS_ON_ROAD',
  WEATHER_HAZARD = 'WEATHER_HAZARD',
  ANIMAL_CROSSING = 'ANIMAL_CROSSING',
  BROKEN_TRAFFIC_LIGHT = 'BROKEN_TRAFFIC_LIGHT',
  ROAD_CLOSURE = 'ROAD_CLOSURE',
  DANGEROUS_CURVE = 'DANGEROUS_CURVE',
  STEEP_HILL = 'STEEP_HILL',
  SLIPPERY_ROAD = 'SLIPPERY_ROAD',
  OTHER = 'OTHER',
}

interface ICreateWarning {
  type: WarningType;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
}

export const useWarningService = () => {
  const {t} = useTranslation();

  const sendWarning = useCallback(
    async (warning: ICreateWarning) => {
      try {
        // TODO: Implement GraphQL mutation to send warning to backend
        console.log('Sending warning:', warning);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        showToast({
          text1: t('components.warningBottomSheet.warning_sent'),
          text2: t('components.warningBottomSheet.riders_notified'),
          type: 'success',
        });
      } catch (error) {
        console.error('Error sending warning:', error);
        showToast({
          text1: t('common.error'),
          text2: t('components.warningBottomSheet.send_error'),
          type: 'error',
        });
      }
    },
    [t],
  );

  return {
    sendWarning,
  };
};

export {WarningType, type ICreateWarning};
