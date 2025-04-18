import React from 'react';
import {
  StyleSheet,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import {View, Text} from 'react-native-ui-lib';
import {ImageSize, ImageStyle, ButtonProps} from '../types/common';

interface Tag {
  id: string;
  label: string;
}

type ImagePosition = 'left' | 'leftTop' | 'center';
type ButtonPosition = 'left' | 'center' | 'right';

interface CardProps {
  image: ImageSourcePropType;
  imageStyle?: ImageStyle;
  imageSize?: ImageSize;
  imagePosition?: ImagePosition;
  title: string;
  subtitle?: string;
  description?: string;
  smallTexts?: string[];
  tags?: Tag[];
  tagSize?: 'small' | 'regular';
  layout?: 'horizontal' | 'vertical';
  button?: ButtonProps & {
    position?: ButtonPosition;
  };
}

export const Card: React.FC<CardProps> = ({
  image,
  imageStyle = 'square',
  imageSize = 'medium',
  imagePosition = 'left',
  title,
  subtitle,
  description,
  smallTexts = [],
  tags = [],
  tagSize = 'regular',
  layout = 'horizontal',
  button,
}) => {
  const getImageContainerStyle = () => {
    const baseStyle =
      layout === 'vertical' ? {alignItems: 'center' as const} : {};

    const positionStyle =
      imagePosition === 'leftTop'
        ? {alignSelf: 'flex-start' as const}
        : imagePosition === 'center'
          ? {alignItems: 'center' as const}
          : {};

    return [baseStyle, positionStyle];
  };

  const getImageSizeStyle = () => {
    switch (imageSize) {
      case 'small':
        return {width: 48, height: 48};
      case 'large':
        return {width: 100, height: 100};
      default:
        return {width: 64, height: 64};
    }
  };

  const getButtonContainerStyle = () => {
    const styles = [];
    if (button?.position === 'center') {
      styles.push(containerStyles.buttonCenterAlign);
    } else if (button?.position === 'right') {
      styles.push(containerStyles.buttonRightAlign);
    }
    return styles;
  };

  const getButtonStyle = () => {
    const baseStyle = {
      backgroundColor: '#007AFF',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 4,
    };

    const sizeStyle =
      button?.size === 'small'
        ? {
            paddingHorizontal: 12,
            paddingVertical: 6,
          }
        : button?.size === 'large'
          ? {
              paddingHorizontal: 20,
              paddingVertical: 10,
            }
          : {};

    const shapeStyle =
      button?.style === 'circle'
        ? {
            borderRadius: 50,
            aspectRatio: 1,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
          }
        : button?.style === 'round'
          ? {
              borderRadius: 25,
            }
          : {};

    return [containerStyles.button, baseStyle, sizeStyle, shapeStyle];
  };

  return (
    <View style={containerStyles.container}>
      <View
        style={[
          containerStyles.topContainer,
          layout === 'vertical' && containerStyles.verticalLayout,
        ]}>
        <View style={getImageContainerStyle()}>
          <Image
            source={image}
            style={[
              containerStyles.image,
              getImageSizeStyle(),
              imageStyle === 'circle' && containerStyles.circleImage,
              layout === 'vertical' && containerStyles.verticalImage,
            ]}
          />
        </View>
        <View
          style={[
            containerStyles.contentContainer,
            layout === 'vertical' && containerStyles.verticalContentContainer,
          ]}>
          <Text style={containerStyles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={containerStyles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
          {description && (
            <Text style={containerStyles.description} numberOfLines={2}>
              {description}
            </Text>
          )}
          {smallTexts.length > 0 && (
            <View style={containerStyles.smallTextsContainer}>
              {smallTexts.map((text, index) => (
                <Text key={index} style={containerStyles.smallText}>
                  {text}
                </Text>
              ))}
            </View>
          )}
          {tags.length > 0 && (
            <View style={containerStyles.tagsContainer}>
              {tags.map(tag => (
                <View
                  key={tag.id}
                  style={[
                    containerStyles.tag,
                    tagSize === 'small' && containerStyles.tagSmall,
                  ]}>
                  <Text
                    style={[
                      containerStyles.tagText,
                      tagSize === 'small' && containerStyles.tagTextSmall,
                    ]}>
                    {tag.label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      {button && (
        <View
          style={[
            containerStyles.buttonContainer,
            ...getButtonContainerStyle(),
          ]}>
          <TouchableOpacity style={getButtonStyle()} onPress={button.onPress}>
            <Text style={containerStyles.buttonText}>{button.label}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const containerStyles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    marginVertical: 6,
  },
  topContainer: {
    flexDirection: 'row',
  },
  verticalLayout: {
    flexDirection: 'column',
  },
  image: {
    borderRadius: 8,
  },
  verticalImage: {
    marginBottom: 8,
  },
  circleImage: {
    borderRadius: 999,
  },
  imageCenterAlign: {
    alignItems: 'center',
  },
  imageLeftTopAlign: {
    alignSelf: 'flex-start',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
  },
  verticalContentContainer: {
    marginLeft: 0,
    marginTop: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
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
    color: '#666666',
    marginBottom: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 4,
    marginBottom: 4,
  },
  tagSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#666666',
  },
  tagTextSmall: {
    fontSize: 10,
  },
  buttonContainer: {
    marginTop: 8,
  },
  buttonCenterAlign: {
    alignItems: 'center',
  },
  buttonRightAlign: {
    alignItems: 'flex-end',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
