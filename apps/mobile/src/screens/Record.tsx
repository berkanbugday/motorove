import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import {lineString, along, length, bbox} from '@turf/turf';

// Initialize Mapbox - Replace with your actual token
MapboxGL.setAccessToken(
  'pk.eyJ1IjoiYmVya2FuYnVnZGF5IiwiYSI6ImNtODNhaXByZjFmejYya3Nhdzhoa3NkaTMifQ.0o__L4YytBYoLPzcZBigDg',
);

const ANIMATION_DURATION = 10000;
const INITIAL_COORDINATES = [33.470359, 40.5781289]; // Çankırı Seydiköy coordinates
const MIN_ZOOM = 11; // Wider view
const MAX_ZOOM = 12; // Less close-up
const BASE_TERRAIN = 3; // Fixed terrain exaggeration to prevent jumping
const CAMERA_TRANSITION_DURATION = 500; // Smoother camera transitions
const BASE_HEADING = 150;
const BASE_PITCH = 60;

// Animation constants
const HEADING_VARIATION = 30;
const PITCH_VARIATION = 10;
const FOLLOW_DISTANCE = 0.002;

export const RecordScreen = () => {
  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const lastCameraUpdate = useRef<number>(0);

  const [elevation, setElevation] = useState<number>(0);
  const [markerCoordinates, setMarkerCoordinates] =
    useState(INITIAL_COORDINATES);
  const [routeProgress, setRouteProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [drawnCoordinates, setDrawnCoordinates] = useState([
    INITIAL_COORDINATES,
  ]);
  const [currentZoom, setCurrentZoom] = useState(MIN_ZOOM);
  const [isForward, setIsForward] = useState(true);

  // Route data from Seydiköy to Çankırı Merkez
  const routeCoordinates = useMemo(
    () => [
      [33.470359, 40.5781289], // Seydiköy start
      [33.472, 40.579],
      [33.474, 40.5795],
      [33.475, 40.58],
      [33.477, 40.581],
      [33.479, 40.5815],
      [33.48, 40.582],
      [33.482, 40.583],
      [33.484, 40.5835],
      [33.485, 40.584],
      [33.487, 40.585],
      [33.489, 40.5855],
      [33.49, 40.586],
      [33.492, 40.587],
      [33.494, 40.5875],
      [33.495, 40.588],
      [33.497, 40.589],
      [33.499, 40.5895],
      [33.5, 40.59],
      [33.502, 40.591],
      [33.504, 40.5915],
      [33.505, 40.592],
      [33.507, 40.593],
      [33.509, 40.5935],
      [33.51, 40.594],
      [33.512, 40.5945],
      [33.514, 40.5948],
      [33.515, 40.595],
      [33.517, 40.5955],
      [33.519, 40.5958],
      [33.52, 40.596],
      [33.522, 40.5965],
      [33.524, 40.5968],
      [33.525, 40.597],
      [33.527, 40.5975],
      [33.529, 40.5978],
      [33.53, 40.598],
      [33.532, 40.5985],
      [33.534, 40.5988],
      [33.535, 40.599],
      [33.537, 40.5992],
      [33.539, 40.5994],
      [33.54, 40.5995],
      [33.542, 40.5996],
      [33.544, 40.5997],
      [33.545, 40.5998],
      [33.547, 40.5999],
      [33.549, 40.59995],
      [33.55, 40.6],
      [33.552, 40.6],
      [33.554, 40.6],
      [33.555, 40.6],
      [33.557, 40.6],
      [33.559, 40.6],
      [33.56, 40.6],
      [33.562, 40.6],
      [33.564, 40.6],
      [33.565, 40.6],
      [33.567, 40.6],
      [33.569, 40.6],
      [33.57, 40.6],
      [33.572, 40.6],
      [33.574, 40.6],
      [33.575, 40.6],
      [33.577, 40.6],
      [33.579, 40.6],
      [33.58, 40.6],
      [33.582, 40.6],
      [33.584, 40.6],
      [33.585, 40.6],
      [33.587, 40.6],
      [33.589, 40.6],
      [33.59, 40.6],
      [33.592, 40.6],
      [33.594, 40.6],
      [33.595, 40.6],
      [33.597, 40.6],
      [33.599, 40.6],
      [33.6, 40.6],
      [33.602, 40.6],
      [33.604, 40.6],
      [33.605, 40.6],
      [33.607, 40.6],
      [33.609, 40.6],
      [33.61, 40.6],
      [33.612, 40.6],
      [33.614, 40.6],
      [33.615, 40.6],
      [33.617, 40.6], // Çankırı Merkez end
    ],
    [],
  );

  const route = useMemo(() => lineString(routeCoordinates), [routeCoordinates]);
  const [minLng, minLat, maxLng, maxLat] = useMemo(() => bbox(route), [route]);

  // Calculate the center and deltas for the region
  const centerLng = (minLng + maxLng) / 2;
  const centerLat = (minLat + maxLat) / 2;
  const latDelta = (maxLat - minLat) * 1.5; // Add 50% padding
  const lngDelta = (maxLng - minLng) * 1.5;

  const resetCamera = useCallback(() => {
    cameraRef.current?.setCamera({
      centerCoordinate: [centerLng, centerLat],
      zoomLevel: 10,
      pitch: 60,
      heading: 150,
      animationDuration: 1000,
    });
  }, [centerLng, centerLat]);

  const resetAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    startTimeRef.current = undefined;
    setMarkerCoordinates(INITIAL_COORDINATES);
    setDrawnCoordinates([INITIAL_COORDINATES]);
    resetCamera();
  }, [resetCamera]);

  useEffect(() => {
    resetCamera();
  }, [resetCamera]);

  const updateElevation = useCallback(async (coordinates: number[]) => {
    try {
      if (mapRef.current) {
        const elevation = await mapRef.current.queryTerrainElevation(
          coordinates,
        );
        if (elevation !== null) {
          setElevation(Math.floor(elevation));
        }
      }
    } catch (error) {
      console.error('Error getting elevation:', error);
    }
  }, []);

  const calculateCameraPosition = useCallback(
    (progress: number, coordinates: number[]) => {
      const heading =
        BASE_HEADING + Math.sin(progress * Math.PI * 2) * HEADING_VARIATION;
      const pitch =
        BASE_PITCH + Math.sin(progress * Math.PI * 3) * PITCH_VARIATION;

      const bearingRad = (heading * Math.PI) / 180;
      const offsetLng = -Math.sin(bearingRad) * FOLLOW_DISTANCE;
      const offsetLat = -Math.cos(bearingRad) * FOLLOW_DISTANCE;

      // Calculate zoom based on direction
      const zoomProgress = isForward ? progress : 1 - progress;
      const dynamicZoom =
        MIN_ZOOM + (MAX_ZOOM - MIN_ZOOM) * Math.sin(zoomProgress * Math.PI);

      return {
        centerCoordinate: [
          coordinates[0] + offsetLng,
          coordinates[1] + offsetLat,
        ],
        heading,
        pitch,
        zoomLevel: dynamicZoom,
      };
    },
    [isForward],
  );

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = (timestamp - startTimeRef.current) / ANIMATION_DURATION;

      if (progress > 1) {
        // Toggle direction when animation completes
        setIsForward(!isForward);
        setIsAnimating(false);
        resetAnimation();
        return;
      }

      const path = lineString(routeCoordinates);
      const pathDistance = length(path, {units: 'kilometers'});
      // Use forward or reverse progress based on direction
      const currentPoint = along(
        path,
        isForward ? pathDistance * progress : pathDistance * (1 - progress),
      );
      const newCoordinates = currentPoint.geometry.coordinates;

      setMarkerCoordinates(newCoordinates);
      setDrawnCoordinates(prev => [...prev, newCoordinates]);
      setRouteProgress(progress);

      if (timestamp - lastCameraUpdate.current > 1000) {
        updateElevation(newCoordinates);
        lastCameraUpdate.current = timestamp;
      }

      const cameraConfig = calculateCameraPosition(progress, newCoordinates);
      cameraRef.current?.setCamera({
        ...cameraConfig,
        animationDuration: CAMERA_TRANSITION_DURATION,
      });

      animationRef.current = requestAnimationFrame(animate);
    },
    [
      routeCoordinates,
      updateElevation,
      calculateCameraPosition,
      resetAnimation,
      isForward,
    ],
  );

  const toggleAnimation = () => {
    if (isAnimating) {
      resetAnimation();
    } else {
      animationRef.current = requestAnimationFrame(animate);
    }
    setIsAnimating(!isAnimating);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={MapboxGL.StyleURL.SatelliteStreet}
        pitchEnabled={true}
        rotateEnabled={true}>
        <MapboxGL.Camera
          ref={cameraRef}
          centerCoordinate={[centerLng, centerLat]}
          zoomLevel={10}
          animationDuration={CAMERA_TRANSITION_DURATION}
          pitch={BASE_PITCH}
          heading={BASE_HEADING}
          followUserLocation={false}
        />

        <MapboxGL.RasterDemSource
          id="mapbox-dem"
          url="mapbox://mapbox.terrain-rgb"
          tileSize={512}
          maxZoomLevel={14}
        />

        <MapboxGL.Terrain
          sourceID="mapbox-dem"
          style={{exaggeration: BASE_TERRAIN}}
        />

        {/* Full route line */}
        <MapboxGL.ShapeSource
          id="routeSource"
          shape={{
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates,
            },
          }}>
          <MapboxGL.LineLayer
            id="routeLine"
            style={{
              lineColor: 'rgba(255, 0, 0, 0.3)',
              lineWidth: 5,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </MapboxGL.ShapeSource>

        {/* Drawn path */}
        <MapboxGL.ShapeSource
          id="drawnSource"
          shape={{
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: drawnCoordinates,
            },
          }}>
          <MapboxGL.LineLayer
            id="drawnLine"
            style={{
              lineColor: 'red',
              lineWidth: 5,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </MapboxGL.ShapeSource>

        <MapboxGL.PointAnnotation
          id="currentLocation"
          coordinate={markerCoordinates}>
          <View style={styles.markerContainer} />
        </MapboxGL.PointAnnotation>
      </MapboxGL.MapView>

      <View style={styles.elevationContainer}>
        <Text style={styles.elevationText}>
          Altitude: {Math.floor(elevation)}m
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleAnimation}>
          <Text style={styles.controlButtonText}>
            {isAnimating ? 'Stop' : 'Start'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.resetButton]}
          onPress={resetCamera}>
          <Text style={styles.controlButtonText}>Reset View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  elevationContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  elevationText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  markerContainer: {
    width: 20,
    height: 20,
    backgroundColor: 'red',
    borderRadius: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resetButton: {
    backgroundColor: '#4CAF50',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
