import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View, TouchableOpacity, Text, Platform} from 'react-native';
import Mapbox, {Camera, MapView, MarkerView} from '@rnmapbox/maps';
import {lineString as makeLineString, point} from '@turf/helpers';
import * as turf from '@turf/turf';
import {Animated, Easing} from 'react-native';

// Initialize MapBox
Mapbox.setAccessToken(
  'pk.eyJ1IjoiYmVya2FuYnVnZGF5IiwiYSI6ImNtODNhaXByZjFmejYya3Nhdzhoa3NkaTMifQ.0o__L4YytBYoLPzcZBigDg',
);

// Define a more realistic walking route with multiple waypoints
const ROUTE_WAYPOINTS: [number, number][] = [
  [33.470359, 40.5781289], // Start - Seydiköy
  [33.45, 40.59], // First waypoint heading north
  [33.43, 40.61], // Continue north with slight west
  [33.41, 40.64], // Mid route
  [33.39, 40.67], // Getting closer to city
  [33.38, 40.7], // Approaching city center
  [33.366111, 40.735556], // End - Çankırı Merkez
];

type Position = [number, number];

export function RecordScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [coordinates, setCoordinates] = useState<Position[]>([]);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const mapRef = useRef<MapView>(null);
  const cameraRef = useRef<Camera>(null);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const markerScale = useRef(new Animated.Value(0)).current;

  // Generate 1000 route points with natural variations
  const generateRoutePoints = (): Position[] => {
    // Create a curved line through all waypoints
    const line = makeLineString(ROUTE_WAYPOINTS);
    const length = turf.length(line, {units: 'kilometers'});
    const points: Position[] = [];
    const totalPoints = 1000;

    for (let i = 0; i < totalPoints; i++) {
      // Calculate position along the line
      const along = (i / (totalPoints - 1)) * length;
      const basePoint = turf.along(line, along, {units: 'kilometers'});

      // Add small random variations to simulate natural walking and GPS drift
      const jitterAmount = 0.00002; // About 2 meters
      const jitteredCoord: Position = [
        basePoint.geometry.coordinates[0] +
          (Math.random() - 0.5) * jitterAmount,
        basePoint.geometry.coordinates[1] +
          (Math.random() - 0.5) * jitterAmount,
      ];

      points.push(jitteredCoord);
    }

    return points;
  };

  const animateMarker = () => {
    Animated.sequence([
      Animated.timing(markerScale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.bounce,
      }),
      Animated.timing(markerScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.bounce,
      }),
    ]).start();
  };

  const startRecording = () => {
    setIsRecording(true);
    const routePoints = generateRoutePoints();
    let currentIndex = 0;
    setCurrentPosition(routePoints[0]);

    animationRef.current = setInterval(() => {
      if (currentIndex < routePoints.length) {
        setCoordinates(prev => [...prev, routePoints[currentIndex]]);
        setCurrentPosition(routePoints[currentIndex]);
        animateMarker();

        // Animate camera with lookahead
        const lookaheadIndex = Math.min(
          currentIndex + 10,
          routePoints.length - 1,
        );
        const bearing = turf.bearing(
          point(routePoints[currentIndex]),
          point(routePoints[lookaheadIndex]),
        );

        cameraRef.current?.setCamera({
          centerCoordinate: routePoints[currentIndex],
          zoomLevel: 14,
          pitch: 75,
          // heading: bearing,
          animationDuration: 1000,
          animationMode: 'flyTo',
        });

        currentIndex++;
      } else {
        stopRecording();
      }
    }, 30); // Faster update interval
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    setCoordinates([]);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={Mapbox.StyleURL.Satellite}>
        <Mapbox.RasterDemSource
          id="mapbox-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={512}
          maxZoomLevel={14}
        />
        <Mapbox.BackgroundLayer
          id="background"
          style={{
            backgroundColor: '#000000',
          }}
        />
        <Mapbox.SkyLayer
          id="sky"
          style={{
            skyType: 'atmosphere',
            skyAtmosphereSun: [0.0, 90.0],
            skyAtmosphereSunIntensity: 15,
          }}
        />
        <Mapbox.Camera
          ref={cameraRef}
          centerCoordinate={ROUTE_WAYPOINTS[0]}
          zoomLevel={15}
          pitch={45}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {coordinates.length > 0 && (
          <Mapbox.ShapeSource
            id="routeSource"
            shape={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: coordinates,
              },
            }}>
            <Mapbox.LineLayer
              id="routeLine"
              sourceID="routeSource"
              style={{
                lineColor: '#F44336',
                lineWidth: 4,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {currentPosition && (
          <MarkerView coordinate={currentPosition}>
            <Animated.View
              style={[
                styles.marker,
                {
                  transform: [{scale: markerScale}],
                },
              ]}
            />
          </MarkerView>
        )}
      </Mapbox.MapView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            isRecording ? styles.stopButton : styles.startButton,
          ]}
          onPress={isRecording ? stopRecording : startRecording}>
          <Text style={styles.buttonText}>
            {isRecording ? 'Stop' : 'Start'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F44336',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
