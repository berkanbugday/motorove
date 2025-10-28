import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {RNMap} from '@components/RNMap';
import {Region, LatLng} from 'react-native-maps';
import {colors} from '@theme/colors';
import {spacing} from '@theme/spacing';
import {Button} from '@components/Button';
import {Icon} from '@components/Icon';
import Geolocation from '@react-native-community/geolocation';
import {RNMapMarkerItem} from '@components/RNMap/types';
import {Body, BodySmall} from '@components/Typography';
import {radius} from '@theme/radius';
import {AddressType, ICreateAddress} from '@motorove/shared';
import {EnumUtils} from '@utils/enumUtils';
import {useLanguage} from '@contexts/LanguageContext';
import {useTranslation} from '@hooks/useTranslation';

interface SelectLocationMapProps {
  onLocationSelect: (addresses: ICreateAddress[]) => void;
  onClose: () => void;
  initialAddress?: ICreateAddress;
  addressType: AddressType;
}

export const SelectLocationMap: React.FC<SelectLocationMapProps> = ({
  onLocationSelect,
  initialAddress,
  onClose,
  addressType,
}) => {
  const {language} = useLanguage();
  const {t} = useTranslation();

  // Add map ref for animation
  const mapRef = useRef<any>(null);

  // Default region (Turkey)
  const DEFAULT_REGION: Region = {
    latitude: 39.9334,
    longitude: 32.8597,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationAddresses, setLocationAddresses] = useState<ICreateAddress[]>(
    [],
  );

  // Function to animate to a specific location
  const animateToLocation = (latitude: number, longitude: number) => {
    const newRegion: Region = {
      latitude,
      longitude,
      latitudeDelta: 0.01, // Zoom in closer when selecting a location
      longitudeDelta: 0.01,
    };

    // Animate to the new region
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 800); // 800ms animation duration
    }

    // Update the region state
    setRegion(newRegion);
  };

  // Get user location on mount
  useEffect(() => {
    if (initialAddress) {
      // Use the initial location if provided
      const newRegion = {
        ...DEFAULT_REGION,
        latitude: initialAddress.latitude,
        longitude: initialAddress.longitude,
        latitudeDelta: 0.01, // Zoom in closer for initial location
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      setSelectedLocation({
        latitude: initialAddress.latitude,
        longitude: initialAddress.longitude,
      });

      // Animate to initial location after a short delay to ensure map is ready
      setTimeout(() => {
        if (initialAddress.latitude && initialAddress.longitude) {
          animateToLocation(initialAddress.latitude, initialAddress.longitude);
        }
      }, 500);

      fetchLocationDetails(initialAddress.latitude, initialAddress.longitude);
    } else {
      // Otherwise, get the user's current location
      setIsLoading(true);
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          const newRegion = {
            ...DEFAULT_REGION,
            latitude,
            longitude,
          };
          setRegion(newRegion);
          setSelectedLocation({latitude, longitude});

          // Animate to user's current location
          setTimeout(() => {
            animateToLocation(latitude, longitude);
          }, 500);

          fetchLocationDetails(latitude, longitude);
          setIsLoading(false);
        },
        () => {
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 5000,
        },
      );
    }
  }, [initialAddress]);

  // Fetch location name using reverse geocoding for both Turkish and English
  const fetchLocationDetails = async (latitude: number, longitude: number) => {
    try {
      const addressPromises = EnumUtils.getLanguages().map(
        async languageItem => {
          const languageCode = languageItem.value.toLowerCase();
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1&accept-language=${languageCode}`,
            {
              headers: {
                Accept: 'application/json',
                'User-Agent': 'Motorove',
              },
            },
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Expected JSON response but got ${contentType}`);
          }

          const data = await response.json();

          if (data && data.display_name) {
            // Extract place address
            let hamlet = data.address.hamlet ? `${data.address.hamlet}, ` : '';
            let village = data.address.village
              ? `${data.address.village}, `
              : '';
            let suburb = data.address.suburb ? `${data.address.suburb}, ` : '';
            let town = data.address.town ? `${data.address.town}, ` : '';
            let borough = data.address.borough
              ? `${data.address.borough}, `
              : '';
            let province = data.address.province
              ? `${data.address.province}, `
              : '';
            let country = data.address.country ? `${data.address.country}` : '';
            const address = `${hamlet}${village}${suburb}${town}${borough}${province}${country}`;

            return {
              address: address || data.display_name,
              language: languageItem.value,
              type: addressType,
              latitude,
              longitude,
            } as ICreateAddress;
          }

          return null;
        },
      );

      const addresses = await Promise.all(addressPromises);
      const validAddresses = addresses.filter(
        addr => addr !== null,
      ) as ICreateAddress[];
      setLocationAddresses(validAddresses);
    } catch (error) {
      console.error('Error fetching location details:', error);
      setLocationAddresses([]);
    }
  };

  const handleMapPress = (event: {nativeEvent: {coordinate: LatLng}}) => {
    const {coordinate} = event.nativeEvent;
    setSelectedLocation(coordinate);

    // Animate to the selected location
    animateToLocation(coordinate.latitude, coordinate.longitude);

    fetchLocationDetails(coordinate.latitude, coordinate.longitude);
  };

  const handleSelectLocation = () => {
    if (selectedLocation) {
      onLocationSelect(locationAddresses);
    }
  };

  const handleResetLocation = () => {
    setSelectedLocation(null);
    setLocationAddresses([]);

    // Animate back to default region
    const defaultRegion = {
      ...DEFAULT_REGION,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };

    if (mapRef.current) {
      mapRef.current.animateToRegion(defaultRegion, 800);
    }

    setRegion(defaultRegion);

    onLocationSelect([]);
    onClose();
  };

  // Create a marker when a location is selected
  const getMarkers = (): RNMapMarkerItem[] => {
    if (!selectedLocation) {
      return [];
    }

    return [
      {
        id: '1',
        coordinate: selectedLocation,
        pinColor: colors.primary.main,
        zIndex: 1,
      },
    ];
  };

  // Get the display address (prefer English, fallback to Turkish or first available)
  const getDisplayAddress = () => {
    const address = locationAddresses.find(
      addr => addr.language.toLowerCase() === language,
    );
    return (
      address?.address ||
      t('components.selectLocationMap.address_not_available')
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={colors.neutral.black}
            style={styles.loader}
          />
        ) : (
          <RNMap
            initialRegion={region}
            showUserLocation={true}
            showSearchButton={false}
            showSearchBar={false}
            onPress={handleMapPress}
            style={styles.map}
            markers={getMarkers()}
            mapRef={mapRef}
          />
        )}
        {/* Center indicator */}
        {!selectedLocation && (
          <View style={styles.centerMarker}>
            <Icon name="map-pin-filled" size={36} color={colors.primary.main} />
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {selectedLocation ? (
          <>
            <View style={styles.locationInfo}>
              <Body weight="semiBold" style={styles.locationTitle}>
                {t('components.selectLocationMap.selected_location')}
              </Body>
              <BodySmall style={styles.locationAddress} numberOfLines={2}>
                {getDisplayAddress()}
              </BodySmall>
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title={t('common.reset')}
                variant="outline"
                shape="round"
                onPress={handleResetLocation}
                style={styles.cancelButton}
              />
              <Button
                title={t('common.confirm')}
                variant="dark"
                shape="round"
                onPress={handleSelectLocation}
                style={styles.confirmButton}
              />
            </View>
          </>
        ) : (
          <Body
            align="center"
            color={colors.neutral.grey}
            style={styles.tapInstructions}>
            {t('components.selectLocationMap.tap_to_select')}
          </Body>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  mapContainer: {
    flex: 1,
    marginTop: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -18, // Half of the icon size
    marginTop: -36, // Adjust to align with the bottom of the pin
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
  },
  locationInfo: {
    marginBottom: spacing.md,
  },
  locationTitle: {
    marginBottom: spacing.xs,
  },
  locationAddress: {
    color: colors.neutral.grey,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
  tapInstructions: {
    marginVertical: spacing.sm,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.veryLightGrey,
  },
});
