import React, {useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useMap, Marker} from '../../hooks/useMap';

// Replace with your Mapbox token
Mapbox.setAccessToken(
  'pk.eyJ1IjoiYmVya2FuYnVnZGF5IiwiYSI6ImNtODNhaXByZjFmejYya3Nhdzhoa3NkaTMifQ.0o__L4YytBYoLPzcZBigDg',
);

export function MapScreen() {
  const {userLocation, markers, searchLocation, isLoading, error} = useMap();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const [activeTab, setActiveTab] = useState('map');
  const mapRef = useRef(null);

  const handleSearch = async () => {
    await searchLocation(searchQuery);
  };

  const refreshLocation = async () => {
    await searchLocation(searchQuery);
  };

  const renderMarkers = () => {
    return markers.map(marker => (
      <Mapbox.PointAnnotation
        key={marker.id}
        id={marker.id}
        coordinate={marker.coordinates}
        onSelected={() => setSelectedMarker(marker)}>
        <View style={styles.markerContainer}>
          <Icon
            name={
              marker.type === 'repair'
                ? 'build'
                : marker.type === 'dealer'
                ? 'store'
                : 'local-parking'
            }
            size={24}
            color="#FF4444"
          />
        </View>
      </Mapbox.PointAnnotation>
    ));
  };

  return (
    <View style={styles.container}>
      {/* Search Box */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          placeholderTextColor="#999"
        />
        {isLoading && (
          <ActivityIndicator
            size="small"
            color="#FF4444"
            style={styles.loader}
          />
        )}
        <TouchableOpacity
          onPress={refreshLocation}
          style={styles.refreshButton}>
          <Icon name="refresh" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <TouchableOpacity
          style={styles.errorContainer}
          onPress={refreshLocation}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      )}

      {/* Map View */}
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}>
        <Mapbox.Camera
          zoomLevel={12}
          centerCoordinate={userLocation || [-73.9866, 40.7306]}
        />
        {renderMarkers()}
        {userLocation && (
          <Mapbox.PointAnnotation id="userLocation" coordinate={userLocation}>
            <View style={styles.userLocationMarker} />
          </Mapbox.PointAnnotation>
        )}
      </Mapbox.MapView>

      {/* Marker Detail Modal */}
      <Modal
        isVisible={!!selectedMarker}
        onBackdropPress={() => setSelectedMarker(null)}
        style={styles.modal}>
        {selectedMarker && (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedMarker.title}</Text>
            <Text style={styles.modalDescription}>
              {selectedMarker.description}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setSelectedMarker(null)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  loader: {
    marginLeft: 10,
  },
  errorContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 160 : 130,
    left: 20,
    right: 20,
    backgroundColor: '#FFE5E5',
    padding: 10,
    borderRadius: 8,
    zIndex: 1,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    textAlign: 'center',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    borderWidth: 3,
    borderColor: '#fff',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#FF4444',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#FF4444',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeTabText: {
    color: '#FF4444',
  },
  refreshButton: {
    padding: 8,
    marginLeft: 8,
  },
  retryText: {
    color: '#FF4444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
