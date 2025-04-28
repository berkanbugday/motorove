import React from 'react';
import {View, ScrollView} from 'react-native';
import {Chip} from '@components';
import {styles} from './MapView.styles';
import {Tag} from './types';

interface TagsListProps {
  tags: Tag[];
}

export const TagsList: React.FC<TagsListProps> = ({tags}) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <View style={styles.tagsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsScrollViewContent}>
        {tags.map(tag => (
          <Chip
            key={tag.id}
            label={tag.label}
            onPress={tag.onPress}
            onRemove={tag.onRemove}
            color={tag.color || 'light'}
            variant="filled"
            size="large"
            removable={tag.removable}
            leadingIcon={tag.leadingIcon}
          />
        ))}
      </ScrollView>
    </View>
  );
};
