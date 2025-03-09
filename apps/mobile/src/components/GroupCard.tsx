import React from 'react';
import {StyleSheet, Image, ImageSourcePropType} from 'react-native';
import {View, Text} from 'react-native-ui-lib';

interface Chip {
  id: string;
  label: string;
}

interface GroupCardProps {
  image: ImageSourcePropType;
  imageStyle?: 'square' | 'circle';
  title: string;
  subtitle: string;
  description: string;
  smallTexts?: string[];
  chips?: Chip[];
}

export const GroupCard: React.FC<GroupCardProps> = ({
  image,
  imageStyle = 'square',
  title,
  subtitle,
  description,
  smallTexts = [],
  chips = [],
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Image
          source={image}
          style={[styles.image, imageStyle === 'circle' && styles.circleImage]}
        />
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
          {smallTexts.length > 0 && (
            <View style={styles.smallTextsContainer}>
              {smallTexts.map((text, index) => (
                <Text key={index} style={styles.smallText}>
                  {text}
                </Text>
              ))}
            </View>
          )}
          {chips.length > 0 && (
            <View style={styles.chipsContainer}>
              {chips.map(chip => (
                <View key={chip.id} style={styles.chip}>
                  <Text style={styles.chipText}>{chip.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 8,
  },
  topContainer: {
    flexDirection: 'row',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  circleImage: {
    borderRadius: 40,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: '#444444',
    marginTop: 6,
    lineHeight: 20,
  },
  smallTextsContainer: {
    marginTop: 8,
  },
  smallText: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 2,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12,
    color: '#666666',
  },
});
