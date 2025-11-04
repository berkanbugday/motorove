import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import {Body, useBottomSheet, openBottomSheet} from '@components';
import {colors, spacing, radius} from '@theme';
import {useTranslation} from '@hooks/useTranslation';
import {MapAppType} from '@components/BusinessComments/mapApps.constants';
import {
  MapAppsService,
  InstalledApps,
} from '@components/BusinessComments/mapApps.service';

interface MapAppsBottomSheetContentProps {
  latitude: number;
  longitude: number;
  onClose?: () => void;
}

const MapAppsBottomSheetContent: React.FC<MapAppsBottomSheetContentProps> = ({
  latitude,
  longitude,
  onClose,
}) => {
  const {t} = useTranslation();
  const [installedApps, setInstalledApps] = useState<InstalledApps>({
    [MapAppType.GOOGLE]: false,
    [MapAppType.APPLE]: Platform.OS === 'ios',
    [MapAppType.WAZE]: false,
    [MapAppType.YANDEX]: false,
    [MapAppType.SYGIC]: false,
  });

  const checkInstalledApps = async () => {
    const apps = await MapAppsService.checkInstalledApps();
    setInstalledApps(apps);
  };

  const {closeBottomSheet} = useBottomSheet();

  const openMapApp = (appType: MapAppType) => {
    const isInstalled = installedApps[appType];

    MapAppsService.openMapApp(appType, latitude, longitude, isInstalled, () => {
      closeBottomSheet();
      onClose?.();
    });
  };

  useEffect(() => {
    checkInstalledApps();
  }, []);

  return (
    <ScrollView
      horizontal
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.mapAppsScrollContent}
      style={styles.mapAppsScroll}>
      {/* Google Maps */}
      <TouchableOpacity
        style={[
          styles.mapAppCard,
          !installedApps[MapAppType.GOOGLE] && styles.mapAppCardDisabled,
        ]}
        onPress={() => openMapApp(MapAppType.GOOGLE)}
        activeOpacity={0.7}>
        <Image
          source={require('@assets/images/logos/google-maps.png')}
          resizeMode="center"
          style={styles.mapLogo}
        />
        <Body weight="semiBold" style={styles.mapAppName}>
          {t('screens.map.google_maps')}
        </Body>
      </TouchableOpacity>

      {/* Apple Maps */}
      {Platform.OS === 'ios' && (
        <TouchableOpacity
          style={styles.mapAppCard}
          onPress={() => openMapApp(MapAppType.APPLE)}
          activeOpacity={0.7}>
          <Image
            source={require('@assets/images/logos/apple-maps.png')}
            resizeMode="center"
            style={styles.mapLogo}
          />
          <Body weight="semiBold" style={styles.mapAppName}>
            {t('screens.map.apple_maps')}
          </Body>
        </TouchableOpacity>
      )}

      {/* Waze */}
      <TouchableOpacity
        style={[
          styles.mapAppCard,
          !installedApps[MapAppType.WAZE] && styles.mapAppCardDisabled,
        ]}
        onPress={() => openMapApp(MapAppType.WAZE)}
        activeOpacity={0.7}>
        <Image
          source={require('@assets/images/logos/waze.png')}
          resizeMode="center"
          style={styles.mapLogo}
        />
        <Body weight="semiBold" style={styles.mapAppName}>
          {t('screens.map.waze')}
        </Body>
      </TouchableOpacity>

      {/* Yandex Maps */}
      <TouchableOpacity
        style={[
          styles.mapAppCard,
          !installedApps[MapAppType.YANDEX] && styles.mapAppCardDisabled,
        ]}
        onPress={() => openMapApp(MapAppType.YANDEX)}
        activeOpacity={0.7}>
        <Image
          source={require('@assets/images/logos/yandex-maps.png')}
          resizeMode="center"
          style={styles.mapLogo}
        />
        <Body weight="semiBold" style={styles.mapAppName}>
          {t('screens.map.yandex_maps')}
        </Body>
      </TouchableOpacity>

      {/* Sygic */}
      <TouchableOpacity
        style={[
          styles.mapAppCard,
          !installedApps[MapAppType.SYGIC] && styles.mapAppCardDisabled,
        ]}
        onPress={() => openMapApp(MapAppType.SYGIC)}
        activeOpacity={0.7}>
        <Image
          source={require('@assets/images/logos/sygic.png')}
          resizeMode="center"
          style={styles.mapLogo}
        />
        <Body weight="semiBold" style={styles.mapAppName}>
          {t('screens.map.sygic')}
        </Body>
      </TouchableOpacity>
    </ScrollView>
  );
};

/**
 * Opens the map apps bottom sheet using the BottomSheetProvider
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param t - Translation function
 * @param onClose - Optional callback when bottom sheet closes
 */
export const openMapAppsBottomSheet = (
  latitude: number,
  longitude: number,
  t: (key: string) => string,
  onClose?: () => void,
) => {
  openBottomSheet({
    content: (
      <MapAppsBottomSheetContent
        latitude={latitude}
        longitude={longitude}
        onClose={onClose}
      />
    ),
    showCloseButton: false,
    closeOnBackdropPress: true,
    closeButtonPosition: 'top-right',
    title: t('screens.map.choose_map_app'),
    subtitle: t('screens.map.select_preferred_navigation'),
    snapPoint: 'minimal',
    onClose,
  });
};

const styles = StyleSheet.create({
  mapAppsScroll: {
    paddingBottom: spacing.lg,
  },
  mapAppsScrollContent: {
    gap: spacing.md,
  },
  mapAppName: {
    fontSize: 13,
    textAlign: 'center',
    color: colors.neutral.black,
  },
  mapAppCard: {
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  mapAppCardDisabled: {
    opacity: 0.3,
  },
  mapLogo: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
  },
});
