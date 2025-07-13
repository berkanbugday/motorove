import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {RNMap} from '@components/RNMap';
import {Region, LatLng} from 'react-native-maps';
import {colors} from '@theme/colors';
import {spacing} from '@theme/spacing';
import {Button} from '@components/Button';
import {Icon} from '@components/Icon';
import Geolocation from '@react-native-community/geolocation';
import {RNMapMarkerType} from '@components/RNMap/types';
import {Body, BodySmall} from '@components/Typography';
import {radius} from '@theme/radius';
import {IAddress, AddressType, Language} from '@motorove/shared';

interface SelectLocationMapProps {
  onLocationSelect: (location: {
    latitude?: number;
    longitude?: number;
    name?: string;
    addresses?: IAddress[];
  }) => void;
  onClose: () => void;
  initialLocation?: {
    latitude?: number;
    longitude?: number;
    addresses?: IAddress[];
  };
}

export const SelectLocationMap: React.FC<SelectLocationMapProps> = ({
  onLocationSelect,
  initialLocation,
  onClose,
}) => {
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
  const [locationAddresses, setLocationAddresses] = useState<IAddress[]>([]);

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
    if (initialLocation?.latitude && initialLocation?.longitude) {
      // Use the initial location if provided
      const newRegion = {
        ...DEFAULT_REGION,
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.01, // Zoom in closer for initial location
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      setSelectedLocation({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
      });

      // Animate to initial location after a short delay to ensure map is ready
      setTimeout(() => {
        if (initialLocation.latitude && initialLocation.longitude) {
          animateToLocation(
            initialLocation.latitude,
            initialLocation.longitude,
          );
        }
      }, 500);

      if (initialLocation.addresses && initialLocation.addresses.length > 0) {
        setLocationAddresses(initialLocation.addresses);
      } else {
        fetchLocationDetails(
          initialLocation.latitude,
          initialLocation.longitude,
        );
      }
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
        error => {
          console.log('Error getting location:', error);
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 5000,
        },
      );
    }
  }, [initialLocation]);

  // Fetch location name using reverse geocoding for both Turkish and English
  const fetchLocationDetails = async (latitude: number, longitude: number) => {
    try {
      const languages = [Language.EN.toLowerCase(), Language.TR.toLowerCase()];
      const addressPromises = languages.map(async language => {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1&accept-language=${language}`,
          {
            headers: {
              Accept: 'application/json',
              'User-Agent': 'Motorove Mobile App', // Nominatim requires a user agent
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
          let village = data.address.village ? `${data.address.village}, ` : '';
          let suburb = data.address.suburb ? `${data.address.suburb}, ` : '';
          let town = data.address.town ? `${data.address.town}, ` : '';
          let borough = data.address.borough ? `${data.address.borough}, ` : '';
          let province = data.address.province
            ? `${data.address.province}, `
            : '';
          let country = data.address.country ? `${data.address.country}` : '';
          const address = `${hamlet}${village}${suburb}${town}${borough}${province}${country}`;

          return {
            address: address || data.display_name,
            language,
            type: AddressType.POST_LOCATION,
            latitude,
            longitude,
          } as IAddress;
        }

        return null;
      });

      const addresses = await Promise.all(addressPromises);
      const validAddresses = addresses.filter(
        addr => addr !== null,
      ) as IAddress[];
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
      onLocationSelect({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        addresses: locationAddresses,
      });
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

    onLocationSelect({
      latitude: undefined,
      longitude: undefined,
      addresses: [],
    });
    onClose();
  };

  // Create a marker when a location is selected
  const getMarkers = (): RNMapMarkerType[] => {
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
    if (locationAddresses.length === 0) {
      return 'Address not available';
    }

    const englishAddress = locationAddresses.find(
      addr => addr.language === Language.EN.toLowerCase(),
    );
    const turkishAddress = locationAddresses.find(
      addr => addr.language === Language.TR.toLowerCase(),
    );

    return (
      englishAddress?.address ||
      turkishAddress?.address ||
      locationAddresses[0]?.address ||
      'Address not available'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary.main}
            style={styles.loader}
          />
        ) : (
          <RNMap
            initialRegion={region}
            showUserLocation={true}
            showLoadMarkerButton={false}
            showSearchBar={false}
            zoomControlEnabled={false}
            onPress={handleMapPress}
            style={styles.map}
            markers={getMarkers()}
            mapRef={mapRef}
          />
        )}
        {/* Center indicator */}
        {!selectedLocation && (
          <View style={styles.centerMarker}>
            <Icon name="map-pin" size={36} color={colors.primary.main} />
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {selectedLocation ? (
          <>
            <View style={styles.locationInfo}>
              <Body weight="semiBold" style={styles.locationTitle}>
                {'Selected Location'}
              </Body>
              <BodySmall style={styles.locationAddress} numberOfLines={2}>
                {getDisplayAddress()}
              </BodySmall>
            </View>
            <View style={styles.buttonContainerWrapper}>
              <View style={styles.buttonContainer}>
                <Button
                  title="Reset"
                  variant="outline"
                  shape="round"
                  onPress={handleResetLocation}
                  style={styles.cancelButton}
                />
                <Button
                  title="Confirm"
                  variant="dark"
                  shape="round"
                  onPress={handleSelectLocation}
                  style={styles.confirmButton}
                />
              </View>
            </View>
          </>
        ) : (
          <Body
            align="center"
            color={colors.neutral.grey}
            style={styles.tapInstructions}>
            Tap on the map to select a location
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
  buttonContainerWrapper: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  confirmButton: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  removeButton: {
    backgroundColor: colors.primary.light,
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
