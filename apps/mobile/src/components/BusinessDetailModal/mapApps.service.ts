import {Linking, Platform} from 'react-native';
import {
  APP_SCHEMES,
  APP_STORE_URLS,
  MapAppType,
  getNavigationUrl,
} from './mapApps.constants';

export interface InstalledApps {
  [MapAppType.GOOGLE]: boolean;
  [MapAppType.APPLE]: boolean;
  [MapAppType.WAZE]: boolean;
  [MapAppType.YANDEX]: boolean;
  [MapAppType.SYGIC]: boolean;
}

/**
 * Map Apps Service
 * Handles checking installed map apps, opening them, and redirecting to app stores
 */
export class MapAppsService {
  /**
   * Check which map apps are installed on the device
   * @returns Object with installation status for each app
   */
  static async checkInstalledApps(): Promise<InstalledApps> {
    const apps: InstalledApps = {
      [MapAppType.GOOGLE]: false,
      [MapAppType.APPLE]: Platform.OS === 'ios', // Apple Maps always available on iOS
      [MapAppType.WAZE]: false,
      [MapAppType.YANDEX]: false,
      [MapAppType.SYGIC]: false,
    };

    // Check Google Maps
    try {
      if (APP_SCHEMES[MapAppType.GOOGLE]) {
        apps[MapAppType.GOOGLE] = await Linking.canOpenURL(
          APP_SCHEMES[MapAppType.GOOGLE],
        );
      }
    } catch (e) {
      apps[MapAppType.GOOGLE] = false;
    }

    // Check Waze
    try {
      apps[MapAppType.WAZE] = await Linking.canOpenURL(
        APP_SCHEMES[MapAppType.WAZE],
      );
    } catch (e) {
      apps[MapAppType.WAZE] = false;
    }

    // Check Yandex Maps
    try {
      apps[MapAppType.YANDEX] = await Linking.canOpenURL(
        APP_SCHEMES[MapAppType.YANDEX],
      );
    } catch (e) {
      apps[MapAppType.YANDEX] = false;
    }

    // Check Sygic
    try {
      apps[MapAppType.SYGIC] = await Linking.canOpenURL(
        APP_SCHEMES[MapAppType.SYGIC],
      );
    } catch (e) {
      apps[MapAppType.SYGIC] = false;
    }

    return apps;
  }

  /**
   * Get the app store URL for a specific map app
   * @param appType - Type of map app
   * @returns App store URL or null if not available
   */
  static getAppStoreUrl(appType: MapAppType): string | null | undefined {
    return APP_STORE_URLS[appType];
  }

  /**
   * Open a map app with navigation to specific coordinates
   * If app is not installed, redirects to app store
   * @param appType - Type of map app to open
   * @param latitude - Destination latitude
   * @param longitude - Destination longitude
   * @param isInstalled - Whether the app is installed
   * @param onClose - Callback to close the modal/sheet
   * @returns Promise that resolves when the operation completes
   */
  static async openMapApp(
    appType: MapAppType,
    latitude: number,
    longitude: number,
    isInstalled: boolean,
    onClose?: () => void,
  ): Promise<void> {
    // If app is not installed, redirect to app store
    if (!isInstalled) {
      const storeUrl = this.getAppStoreUrl(appType);
      if (storeUrl) {
        try {
          await Linking.openURL(storeUrl);
        } catch (error) {
          console.error('Error opening app store:', error);
        } finally {
          onClose?.();
        }
      }
      return;
    }

    // Get navigation URL for the app
    const url = getNavigationUrl(appType, latitude, longitude);

    try {
      await Linking.openURL(url);
      onClose?.();
    } catch (error) {
      console.error('Error opening map app:', error);
      // If opening fails, try to open app store as fallback
      const storeUrl = this.getAppStoreUrl(appType);
      if (storeUrl) {
        try {
          await Linking.openURL(storeUrl);
        } catch (storeError) {
          console.error('Error opening app store:', storeError);
        }
      }
      onClose?.();
    }
  }
}
