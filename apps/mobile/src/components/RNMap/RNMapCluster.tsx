import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {Marker} from 'react-native-maps';
import {RNMapClusterProps, RNMapMarkerType} from './types';
import {RNMapMarker} from './RNMapMarker';
import {colors} from '@theme/colors';

/**
 * Interface for a cluster of markers
 */
interface Cluster {
  id: string;
  count: number;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  markers: RNMapMarkerType[];
}

/**
 * A component to cluster markers on the map
 */
export const RNMapCluster: React.FC<RNMapClusterProps> = ({
  markers,
  radius = 50,
  onMarkerSelect,
  onMarkerDeselect,
  maxZoom = 20,
  minZoom = 0,
  clusterColor = colors.primary.main,
  clusterTextColor = colors.neutral.white,
  clusterBorderColor = colors.neutral.white,
  clusterBorderWidth = 2,
  spiderifyOnMaxZoom = false,
}) => {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [currentZoom, _setCurrentZoom] = useState(10);

  // Simple clustering algorithm based on distance
  useEffect(() => {
    // Skip clustering if no markers or zoom is at max level
    if (
      markers.length === 0 ||
      (spiderifyOnMaxZoom && currentZoom >= maxZoom)
    ) {
      setClusters([]);
      return;
    }

    const createClusters = () => {
      // Adjust radius based on zoom level
      const zoomScale = Math.pow(
        2,
        Math.min(maxZoom, Math.max(minZoom, currentZoom)) / 10,
      );
      const effectiveRadius = radius / zoomScale;

      // Copy markers to avoid mutation
      const remainingMarkers = [...markers];
      const newClusters: Cluster[] = [];

      while (remainingMarkers.length > 0) {
        const marker = remainingMarkers.shift()!;
        const cluster: Cluster = {
          id: `cluster-${newClusters.length}`,
          coordinate: marker.coordinate,
          count: 1,
          markers: [marker],
        };

        // Find all markers within radius
        let i = 0;
        while (i < remainingMarkers.length) {
          const distance = calculateDistance(
            cluster.coordinate.latitude,
            cluster.coordinate.longitude,
            remainingMarkers[i].coordinate.latitude,
            remainingMarkers[i].coordinate.longitude,
          );

          if (distance <= effectiveRadius) {
            // Add to cluster and remove from remaining
            cluster.markers.push(remainingMarkers[i]);
            cluster.count++;
            remainingMarkers.splice(i, 1);
          } else {
            i++;
          }
        }

        // Update cluster coordinate to be average of all points
        if (cluster.count > 1) {
          const latSum = cluster.markers.reduce(
            (sum, m) => sum + m.coordinate.latitude,
            0,
          );
          const lngSum = cluster.markers.reduce(
            (sum, m) => sum + m.coordinate.longitude,
            0,
          );

          cluster.coordinate = {
            latitude: latSum / cluster.count,
            longitude: lngSum / cluster.count,
          };
        }

        newClusters.push(cluster);
      }

      setClusters(newClusters);
    };

    createClusters();
  }, [markers, radius, currentZoom, maxZoom, minZoom, spiderifyOnMaxZoom]);

  // Helper function to calculate distance between two coordinates
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // Distance in meters
    return distance;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const handleClusterPress = (cluster: Cluster) => {
    // If only one marker in cluster, trigger marker press
    if (cluster.count === 1 && onMarkerSelect) {
      onMarkerSelect(cluster.markers[0]);
    }
    // In a real implementation, we might zoom in or "spiderify" the cluster
  };

  return (
    <>
      {clusters.map(cluster => {
        // If cluster only has one marker, render it as a normal marker
        if (cluster.count === 1) {
          return (
            <RNMapMarker
              key={`marker-${cluster.markers[0].id}`}
              marker={cluster.markers[0]}
              onSelect={() => onMarkerSelect?.(cluster.markers[0])}
              onDeselect={onMarkerDeselect}
            />
          );
        }

        // Render as a cluster
        return (
          <Marker
            key={`cluster-${cluster.id}`}
            coordinate={cluster.coordinate}
            onPress={() => handleClusterPress(cluster)}>
            <View
              style={[
                styles.cluster,
                {
                  backgroundColor: clusterColor,
                  borderColor: clusterBorderColor,
                  borderWidth: clusterBorderWidth,
                  // Scale up size based on count, with some constraints
                  width: Math.min(60, Math.max(40, 30 + cluster.count / 2)),
                  height: Math.min(60, Math.max(40, 30 + cluster.count / 2)),
                },
              ]}>
              <Text style={[styles.clusterText, {color: clusterTextColor}]}>
                {cluster.count}
              </Text>
            </View>
          </Marker>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  cluster: {
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  clusterText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
