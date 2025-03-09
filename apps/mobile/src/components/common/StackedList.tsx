import React from 'react';
import {
  StyleSheet,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {View, Text} from 'react-native-ui-lib';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import {ImageSize, ImageStyle, ButtonProps} from '../types/common';

interface Tag {
  id: string;
  label: string;
}

interface BadgeProps {
  content: string | React.ReactNode;
  style?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  customStyle?: any;
}

interface StackedListItemProps {
  image: ImageSourcePropType;
  title: string;
  subtitle?: string;
  description?: string;
  smallTexts?: string[];
  tags?: Tag[];
  badge?: BadgeProps;
  onPress?: () => void;
  button?: Omit<ButtonProps, 'onPress'> & {
    onPress?: () => void;
  };
  rightActions?: {
    text: string;
    color: string;
    onPress: () => void;
  }[];
}

interface StackedListProps {
  items: StackedListItemProps[];
  onItemPress?: (index: number) => void;
  imageSize?: ImageSize;
  imageStyle?: ImageStyle;
  layout?: 'vertical' | 'horizontal';
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32; // Full width minus padding

const RightActions = ({
  actions,
}: {
  actions: StackedListItemProps['rightActions'];
}) => {
  if (!actions) return null;

  return (
    <View style={styles.rightActionsContainer}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.actionButton, {backgroundColor: action.color}]}
          onPress={action.onPress}>
          <Text style={styles.actionText}>{action.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const StackedListItem: React.FC<
  StackedListItemProps & {
    imageSize?: ImageSize;
    imageStyle?: ImageStyle;
  }
> = ({
  image,
  imageSize = 'medium',
  imageStyle = 'square',
  title,
  subtitle,
  description,
  smallTexts = [],
  tags = [],
  badge,
  onPress,
  button,
  rightActions,
}) => {
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

    return [styles.button, baseStyle, sizeStyle, shapeStyle];
  };

  const getBadgeStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      zIndex: 1,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    };

    const sizeStyle = {
      small: {
        minWidth: 16,
        height: 16,
        fontSize: 10,
      },
      medium: {
        minWidth: 20,
        height: 20,
        fontSize: 12,
      },
      large: {
        minWidth: 24,
        height: 24,
        fontSize: 14,
      },
    }[badge?.size || 'medium'];

    const positionStyle = {
      'top-right': {
        top: -8,
        right: -8,
      },
      'top-left': {
        top: -8,
        left: -8,
      },
      'bottom-right': {
        bottom: -8,
        right: -8,
      },
      'bottom-left': {
        bottom: -8,
        left: -8,
      },
    }[badge?.position || 'top-right'];

    const colorStyle = {
      primary: {
        backgroundColor: '#007AFF',
      },
      secondary: {
        backgroundColor: '#8E8E93',
      },
      success: {
        backgroundColor: '#34C759',
      },
      warning: {
        backgroundColor: '#FF9500',
      },
      error: {
        backgroundColor: '#FF3B30',
      },
    }[badge?.style || 'primary'];

    return [
      baseStyle,
      sizeStyle,
      positionStyle,
      colorStyle,
      badge?.customStyle,
    ];
  };

  const renderBadge = () => {
    if (!badge) return null;

    return (
      <View style={getBadgeStyle()}>
        {typeof badge.content === 'string' ? (
          <Text
            style={[styles.badgeText, {fontSize: getBadgeStyle()[2].fontSize}]}>
            {badge.content}
          </Text>
        ) : (
          badge.content
        )}
      </View>
    );
  };

  const renderContent = () => (
    <View style={styles.itemContainer}>
      <View style={styles.imageContainer}>
        {renderBadge()}
        <Image
          source={image}
          style={[
            styles.image,
            getImageSizeStyle(),
            imageStyle === 'circle' && styles.circleImage,
          ]}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}
        {smallTexts.length > 0 && (
          <View style={styles.smallTextsContainer}>
            {smallTexts.map((text, index) => (
              <Text key={index} style={styles.smallText}>
                {text}
              </Text>
            ))}
          </View>
        )}
        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.map(tag => (
              <View key={tag.id} style={styles.tag}>
                <Text style={styles.tagText}>{tag.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      {button && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={getButtonStyle()} onPress={button.onPress}>
            <Text style={styles.buttonText}>{button.label}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const content = onPress ? (
    <TouchableOpacity onPress={onPress}>{renderContent()}</TouchableOpacity>
  ) : (
    renderContent()
  );

  if (rightActions) {
    return (
      <GestureHandlerRootView>
        <ReanimatedSwipeable
          friction={2}
          rightThreshold={40}
          renderRightActions={(progress, dragX) => (
            <RightActions actions={rightActions} />
          )}>
          {content}
        </ReanimatedSwipeable>
      </GestureHandlerRootView>
    );
  }

  return content;
};

export const StackedList: React.FC<StackedListProps> = ({
  items,
  onItemPress,
  imageSize = 'medium',
  imageStyle = 'square',
  layout = 'horizontal',
}) => {
  const ListComponent = layout === 'horizontal' ? ScrollView : View;
  const horizontalProps =
    layout === 'horizontal'
      ? {
          horizontal: true,
          showsHorizontalScrollIndicator: false,
          snapToInterval: CARD_WIDTH + 16,
          decelerationRate: 'fast' as const,
        }
      : {};

  return (
    <ListComponent
      {...horizontalProps}
      contentContainerStyle={[
        styles.container,
        layout === 'vertical' && styles.verticalContainer,
      ]}>
      {items.map((item, index) => (
        <View
          key={index}
          style={[
            styles.cardWrapper,
            layout === 'vertical' && styles.verticalCardWrapper,
          ]}>
          <StackedListItem
            {...item}
            imageSize={imageSize}
            imageStyle={imageStyle}
            onPress={() => onItemPress?.(index)}
          />
        </View>
      ))}
    </ListComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  verticalContainer: {
    paddingVertical: 16,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: 16,
  },
  verticalCardWrapper: {
    width: '100%',
    marginRight: 0,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 12,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.08,
    // shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    borderRadius: 8,
  },
  circleImage: {
    borderRadius: 999,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#444444',
    marginTop: 4,
    lineHeight: 20,
  },
  smallTextsContainer: {
    marginTop: 6,
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
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#666666',
  },
  buttonContainer: {
    marginLeft: 8,
    justifyContent: 'center',
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
  rightActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});
