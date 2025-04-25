import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MapLibreGL from '@maplibre/maplibre-react-native';

/**
 * Explore Screen - Shows a map using MapLibre React Native
 */
export const ExploreScreen: React.FC = () => {
  // Set the coordinates for initial map center
  const [coordinates] = useState<[number, number]>([-73.970895, 40.723279]); // New York coordinates
  const [locationPermission, setLocationPermission] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Request location permissions
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const isGranted =
            await MapLibreGL.requestAndroidLocationPermissions();
          setLocationPermission(isGranted);
          if (!isGranted) {
            Alert.alert(
              'Location Permission Denied',
              'Please enable location permissions in app settings to use your current location on the map.',
            );
          }
        } else {
          // iOS handles permissions through Info.plist
          setLocationPermission(true);
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
        setMapError('Failed to get location permissions');
      }
    };

    requestLocationPermission();
  }, []);

  if (mapError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{mapError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => setMapError(null)}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapLibreGL.MapView
          style={styles.map}
          styleURL="https://demotiles.maplibre.org/style.json"
          zoomLevel={12}
          centerCoordinate={coordinates}
          logoEnabled={false}
          onDidFailLoadingMap={(error: Error) => {
            console.error('Map failed to load:', error);
            setMapError('Failed to load map. Please check your connection.');
          }}>
          <MapLibreGL.Camera
            zoomLevel={12}
            centerCoordinate={coordinates}
            animationMode={'flyTo'}
            animationDuration={2000}
          />
          <MapLibreGL.PointAnnotation
            id="marker"
            coordinate={coordinates}
            title="Marker"
          />
          {locationPermission && (
            <MapLibreGL.UserLocation
              visible={true}
              showsUserHeadingIndicator={true}
              animated={true}
            />
          )}
        </MapLibreGL.MapView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorBox: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    color: '#d32f2f',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
