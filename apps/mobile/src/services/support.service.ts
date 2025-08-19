import {loggingService} from './logging.service';
import {errorService} from './error.service';
import {Platform} from 'react-native';
import * as DeviceInfo from 'react-native-device-info';
import {networkService} from './network.service';

// Types for support request
interface SupportRequest {
  category: string;
  subject: string;
  message: string;
}

/**
 * Service for handling support requests
 */
class SupportService {
  private readonly API_URL = 'https://api.motorove.com/support'; // This would be your actual API endpoint

  /**
   * Send a support request to the backend
   * @param requestData Support request data
   * @returns Promise that resolves when the request is sent
   */
  async sendSupportRequest(requestData: SupportRequest): Promise<void> {
    try {
      // Check network connectivity
      if (!networkService.isNetworkConnected()) {
        throw new Error('No internet connection');
      }

      // Add device information to help with troubleshooting
      const deviceInfo = await this.getDeviceInfo();
      const requestBody = {
        ...requestData,
        deviceInfo,
      };

      loggingService.debug('Sending support request', requestBody);

      // In a real implementation, this would make an actual API call
      // For now, we'll simulate a successful response after a delay
      await this.simulateApiCall(requestBody);

      loggingService.debug('Support request sent successfully');
    } catch (error) {
      loggingService.error('Error sending support request:', error);
      errorService.handleError(error);
      throw error;
    }
  }

  /**
   * Simulate an API call with a delay
   * @param data The data that would be sent to the API
   */
  private async simulateApiCall(data: any): Promise<void> {
    // Log the data that would be sent to the API
    loggingService.debug('Support request data:', data);

    // Simulate network delay
    return new Promise(resolve => {
      setTimeout(resolve, 1000);
    });
  }

  /**
   * Get device information for troubleshooting
   */
  private async getDeviceInfo(): Promise<object> {
    try {
      return {
        platform: Platform.OS,
        platformVersion: Platform.Version,
        brand: await DeviceInfo.getBrand(),
        model: await DeviceInfo.getModel(),
        appVersion: await DeviceInfo.getVersion(),
        buildNumber: await DeviceInfo.getBuildNumber(),
      };
    } catch (error) {
      loggingService.error('Error getting device info:', error);
      return {
        platform: Platform.OS,
        platformVersion: Platform.Version,
      };
    }
  }
}

// Export as singleton
export const supportService = new SupportService();
