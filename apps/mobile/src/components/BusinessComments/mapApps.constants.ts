import {Platform} from 'react-native';

/**
 * Map Apps Constants
 * URL schemes and store URLs for navigation apps
 */

// Map app types enum
export enum MapAppType {
  GOOGLE = 'google',
  APPLE = 'apple',
  WAZE = 'waze',
  YANDEX = 'yandex',
  SYGIC = 'sygic',
}

// App URL schemes for checking installed apps
export const APP_SCHEMES = {
  [MapAppType.GOOGLE]: Platform.select({
    ios: 'comgooglemaps://',
    android: 'geo:0,0', // More reliable for Android
  }),
  [MapAppType.APPLE]: 'maps://', // Apple Maps URL scheme
  [MapAppType.WAZE]: 'waze://',
  [MapAppType.YANDEX]: 'yandexmaps://',
  [MapAppType.SYGIC]: 'com.sygic.aura://',
};

// App Store URLs for downloading apps
export const APP_STORE_URLS = {
  [MapAppType.GOOGLE]: Platform.select({
    ios: 'https://apps.apple.com/app/google-maps/id585027354',
    android:
      'https://play.google.com/store/apps/details?id=com.google.android.apps.maps',
  }),
  [MapAppType.APPLE]: null, // Apple Maps is pre-installed on iOS
  [MapAppType.WAZE]: Platform.select({
    ios: 'https://apps.apple.com/app/waze-navigation-live-traffic/id323229106',
    android: 'https://play.google.com/store/apps/details?id=com.waze',
  }),
  [MapAppType.YANDEX]: Platform.select({
    ios: 'https://apps.apple.com/app/yandex-maps/id313877526',
    android:
      'https://play.google.com/store/apps/details?id=ru.yandex.yandexmaps',
  }),
  [MapAppType.SYGIC]: Platform.select({
    ios: 'https://apps.apple.com/app/sygic-gps-navigation-maps/id585193266',
    android: 'https://play.google.com/store/apps/details?id=com.sygic.aura',
  }),
};

// Navigation URL templates for opening apps with directions
export const getNavigationUrl = (
  appType: MapAppType,
  latitude: number,
  longitude: number,
): string => {
  switch (appType) {
    case MapAppType.GOOGLE:
      return (
        Platform.select({
          ios: `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`,
          android: `google.navigation:q=${latitude},${longitude}&mode=d`,
        }) ||
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      );
    case MapAppType.APPLE:
      return `maps://?daddr=${latitude},${longitude}&dirflg=d`;
    case MapAppType.WAZE:
      return `waze://?ll=${latitude},${longitude}&navigate=yes`;
    case MapAppType.YANDEX:
      return `yandexmaps://build_route_on_map?lat_to=${latitude}&lon_to=${longitude}`;
    case MapAppType.SYGIC:
      return `com.sygic.aura://coordinate|${longitude}|${latitude}|drive`;
    default:
      return '';
  }
};
