// Local enum and interfaces until shared package is updated
enum EmergencyType {
  ACCIDENT = 'ACCIDENT',
  BREAKDOWN = 'BREAKDOWN',
  MEDICAL = 'MEDICAL',
  FUEL_SHORTAGE = 'FUEL_SHORTAGE',
  TIRE_PROBLEM = 'TIRE_PROBLEM',
  BATTERY_DEAD = 'BATTERY_DEAD',
  LOST = 'LOST',
  WEATHER_HAZARD = 'WEATHER_HAZARD',
  ROAD_HAZARD = 'ROAD_HAZARD',
  OTHER = 'OTHER',
}
interface ICreateEmergency {
  type: EmergencyType;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
}

interface IEmergency {
  id: string;
  userId: string;
  type: EmergencyType;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
import {showToast} from '@components/ToastMessage';
import {useTranslation} from '@hooks/useTranslation';

/**
 * Emergency Service
 * Handles emergency notifications and alerts for motorcycle riders
 */
class EmergencyService {
  private static instance: EmergencyService;

  public static getInstance(): EmergencyService {
    if (!EmergencyService.instance) {
      EmergencyService.instance = new EmergencyService();
    }
    return EmergencyService.instance;
  }

  /**
   * Send emergency notification to nearby riders
   * @param emergency Emergency data to send
   * @returns Promise<IEmergency> Created emergency record
   */
  async sendEmergencyNotification(emergency: ICreateEmergency): Promise<IEmergency> {
    try {
      console.log('Sending emergency notification:', emergency);
      
      // TODO: Replace with actual API call to backend
      // const response = await apiClient.post('/emergencies', emergency);
      // return response.data;

      // Mock implementation for now
      const mockEmergency: IEmergency = {
        id: `emergency_${Date.now()}`,
        userId: 'current_user_id', // TODO: Get from auth context
        type: emergency.type,
        title: emergency.title,
        description: emergency.description,
        latitude: emergency.latitude,
        longitude: emergency.longitude,
        address: emergency.address,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Implement actual push notification to nearby riders
      this.notifyNearbyRiders(mockEmergency);

      return mockEmergency;
    } catch (error) {
      console.error('Error sending emergency notification:', error);
      throw new Error('Failed to send emergency notification');
    }
  }

  /**
   * Get active emergencies in a specific area
   * @param latitude Center latitude
   * @param longitude Center longitude
   * @param radiusKm Radius in kilometers
   * @returns Promise<IEmergency[]> List of active emergencies
   */
  async getActiveEmergencies(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<IEmergency[]> {
    try {
      console.log('Getting active emergencies:', {latitude, longitude, radiusKm});
      
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/emergencies/active', {
      //   params: { latitude, longitude, radiusKm }
      // });
      // return response.data;

      // Mock implementation
      return [];
    } catch (error) {
      console.error('Error getting active emergencies:', error);
      return [];
    }
  }

  /**
   * Mark emergency as resolved
   * @param emergencyId Emergency ID to resolve
   * @returns Promise<void>
   */
  async resolveEmergency(emergencyId: string): Promise<void> {
    try {
      console.log('Resolving emergency:', emergencyId);
      
      // TODO: Replace with actual API call
      // await apiClient.patch(`/emergencies/${emergencyId}/resolve`);

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error resolving emergency:', error);
      throw new Error('Failed to resolve emergency');
    }
  }

  /**
   * Notify nearby riders about the emergency
   * @param emergency Emergency data
   */
  private notifyNearbyRiders(emergency: IEmergency): void {
    // TODO: Implement push notification logic
    // This would typically involve:
    // 1. Finding nearby riders within a certain radius
    // 2. Sending push notifications to their devices
    // 3. Optionally sending SMS or other alerts for critical emergencies
    
    console.log('Notifying nearby riders about emergency:', {
      type: emergency.type,
      title: emergency.title,
      location: {
        latitude: emergency.latitude,
        longitude: emergency.longitude,
      },
    });

    // For now, just log that we would send notifications
    // In a real implementation, this would integrate with:
    // - Firebase Cloud Messaging for push notifications
    // - Backend API to find nearby users
    // - SMS service for critical emergencies
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param lat1 First latitude
   * @param lon1 First longitude
   * @param lat2 Second latitude
   * @param lon2 Second longitude
   * @returns Distance in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

// Export singleton instance
export const emergencyService = EmergencyService.getInstance();

// Export hooks for React components
export const useEmergencyService = () => {
  const {t} = useTranslation();

  const sendEmergency = async (emergency: ICreateEmergency): Promise<IEmergency | null> => {
    try {
      const result = await emergencyService.sendEmergencyNotification(emergency);
      
      showToast({
        text1: t('components.emergencyBottomSheet.emergency_sent'),
        text2: t('components.emergencyBottomSheet.help_on_way'),
        type: 'success',
      });
      
      return result;
    } catch (error) {
      showToast({
        text1: t('common.error'),
        text2: t('services.emergency.send_failed'),
        type: 'error',
      });
      return null;
    }
  };

  const getActiveEmergencies = async (
    latitude: number,
    longitude: number,
    radiusKm?: number
  ): Promise<IEmergency[]> => {
    try {
      return await emergencyService.getActiveEmergencies(latitude, longitude, radiusKm);
    } catch (error) {
      console.error('Error getting active emergencies:', error);
      return [];
    }
  };

  const resolveEmergency = async (emergencyId: string): Promise<boolean> => {
    try {
      await emergencyService.resolveEmergency(emergencyId);
      
      showToast({
        text1: t('services.emergency.resolved'),
        text2: t('services.emergency.resolved_message'),
        type: 'success',
      });
      
      return true;
    } catch (error) {
      showToast({
        text1: t('common.error'),
        text2: t('services.emergency.resolve_failed'),
        type: 'error',
      });
      return false;
    }
  };

  return {
    sendEmergency,
    getActiveEmergencies,
    resolveEmergency,
  };
};
