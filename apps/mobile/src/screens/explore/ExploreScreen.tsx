import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {MapView, Tag} from '@components/MapView';
import {SafeAreaView} from 'react-native-safe-area-context';

export const ExploreScreen: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([
    {
      id: '1',
      label: 'Repairs',
      color: 'light',
      onPress: () => {
        setTags(prevTags =>
          prevTags.map(tag =>
            tag.id === '1'
              ? {...tag, color: tag.color === 'light' ? 'dark' : 'light'}
              : tag,
          ),
        );
      },
    },
    {
      id: '2',
      label: 'Dealers',
      color: 'light',
      onPress: () => {
        setTags(prevTags =>
          prevTags.map(tag =>
            tag.id === '2'
              ? {...tag, color: tag.color === 'light' ? 'dark' : 'light'}
              : tag,
          ),
        );
      },
    },
    {
      id: '3',
      label: 'Washing',
      color: 'light',
      onPress: () => {
        setTags(prevTags =>
          prevTags.map(tag =>
            tag.id === '3'
              ? {...tag, color: tag.color === 'light' ? 'dark' : 'light'}
              : tag,
          ),
        );
      },
    },
  ]);
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <MapView
        tags={tags}
        showSearch={true}
        showFilterButton={true}
        showUserLocation={true}
        fullscreen={true}
        showZoomControls={true}
        style={styles.map}
        onMapLoaded={() => console.log('Map loaded')}
        onMapPress={coords => console.log('Map pressed at', coords)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    height: '100%',
  },
});
