import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import {Button, Text, Colors} from 'react-native-ui-lib';
import Geolocation from '@react-native-community/geolocation';
import {SafeAreaView} from 'react-native-safe-area-context';

Mapbox.setAccessToken('YOUR_MAPBOX_ACCESS_TOKEN'); // Replace with your Mapbox token

export function RecordScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const mapRef = useRef(null);

  useEffect(() => {
    // Request location permissions and watch position
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
    }

    const watchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude, speed} = position.coords;
        setCurrentLocation({latitude, longitude});
        if (speed) setSpeed(speed * 3.6); // Convert m/s to km/h
      },
      error => console.log(error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 1000,
        fastestInterval: 1000,
      },
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, []);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const centerOnUser = () => {
    mapRef.current?.setCamera({
      centerCoordinate: [currentLocation.longitude, currentLocation.latitude],
      zoomLevel: 15,
      animationDuration: 500,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <Mapbox.MapView
          ref={mapRef}
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}>
          <Mapbox.Camera
            zoomLevel={15}
            centerCoordinate={[
              currentLocation.longitude,
              currentLocation.latitude,
            ]}
          />
          <Mapbox.UserLocation visible={true} />
        </Mapbox.MapView>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text text70 color={Colors.primary}>
            Distance
          </Text>
          <Text text50 color={Colors.primary}>
            {distance.toFixed(2)} km
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text text70 color={Colors.primary}>
            Speed
          </Text>
          <Text text50 color={Colors.primary}>
            {speed.toFixed(1)} km/h
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          label={isRecording ? 'Stop Recording' : 'Start Recording'}
          backgroundColor={isRecording ? Colors.red30 : Colors.green30}
          style={styles.recordButton}
          onPress={toggleRecording}
        />
        <Button
          label="Center"
          backgroundColor={Colors.blue30}
          style={styles.centerButton}
          onPress={centerOnUser}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grey60,
  },
  statBox: {
    alignItems: 'center',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  recordButton: {
    height: 50,
    borderRadius: 25,
  },
  centerButton: {
    height: 40,
    borderRadius: 20,
    marginTop: 8,
  },
});

export default RecordScreen;
