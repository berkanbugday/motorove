import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {RNMap, RNMapMarkerItem} from '@components/RNMap';
import {useGetBusinesses} from '@services/business.service';
import {IBusiness} from '@motorove/shared';
import {colors} from '@theme/colors';
import Geolocation from '@react-native-community/geolocation';
import {Region} from 'react-native-maps';
import {Button} from '@components/Button';
import {useTranslation} from '@hooks/useTranslation';

// Default region (Turkey - Ankara)
const DEFAULT_REGION: Region = {
  latitude: 39.9334,
  longitude: 32.8597,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

/**
 * MapScreen Component
 * Displays businesses on an interactive map with animated markers
 *
 * Features:
 * - Business markers from backend service
 * - User location detection
 * - Animated region transitions
 * - Business detail cards
 * - Real-time business data
 */
export const MapScreen = () => {
  const {t} = useTranslation();
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedBusinessId, setSelectedBusinessId] = useState<
    string | undefined
  >();
  const mapRef = useRef<any>(null);

  // Fetch businesses from backend
  const {businesses, loading, error, refetch} = useGetBusinesses();

  // Get user location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = useCallback(() => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;

        // Update region to user location
        const newRegion: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        };
        setRegion(newRegion);

        // Animate to user location
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      },
      err => {
        console.error('Error getting user location:', err);
        Alert.alert(
          t('common.error'),
          'Could not get your location. Showing default region.',
        );
      },
      {
        enableHighAccuracy: Platform.OS === 'ios',
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  }, [t]);

  // Convert businesses to map markers
  const markers: RNMapMarkerItem[] = businesses.map(business => ({
    id: business.id,
    coordinate: {
      latitude: business.address.latitude,
      longitude: business.address.longitude,
    },
    business,
    pinColor: colors.neutral.black,
    zIndex: selectedBusinessId === business.id ? 1000 : 1,
  }));

  const handleBusinessSelect = useCallback((business: IBusiness) => {
    setSelectedBusinessId(business.id);
    // You can navigate to business detail screen here
    console.log('Selected business:', business.name);
  }, []);

  const handleMarkerPress = useCallback((marker: RNMapMarkerItem) => {
    if (marker.business) {
      setSelectedBusinessId(marker.business.id);
    }
  }, []);

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Button
          title={t('common.try_again')}
          onPress={refetch}
          variant="primary"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && markers.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      ) : (
        <RNMap
          initialRegion={region}
          markers={markers}
          showUserLocation={true}
          onMarkerPress={handleMarkerPress}
          onBusinessSelect={handleBusinessSelect}
          selectedBusinessId={selectedBusinessId}
          mapRef={mapRef}
          style={styles.map}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
});
