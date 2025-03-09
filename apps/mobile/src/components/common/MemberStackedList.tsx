import React from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {View, Text} from 'react-native-ui-lib';

interface Tag {
  id: string;
  label: string;
}

interface MemberStackedListItemProps {
  id: number;
  avatar: string;
  name: string;
  surname: string;
  tags?: Tag[];
  onPress?: () => void;
  rightButton?: {
    label: string;
    style?: 'primary' | 'secondary' | 'outline';
    onPress: () => void;
  };
}

interface MemberStackedListProps {
  members: MemberStackedListItemProps[];
  onMemberPress?: (index: number) => void;
  layout?: 'vertical' | 'horizontal';
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

const MemberStackedListItem: React.FC<MemberStackedListItemProps> = ({
  avatar,
  name,
  surname,
  tags = [],
  onPress,
  rightButton,
}) => {
  const getButtonStyle = () => {
    const baseStyle = {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 4,
      borderWidth: 1,
    };

    const styleVariants = {
      primary: {
        backgroundColor: '#000000',
        borderColor: '#000000',
      },
      secondary: {
        backgroundColor: '#E5E5E5',
        borderColor: '#E5E5E5',
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: '#000000',
      },
    };

    return [
      styles.button,
      baseStyle,
      styleVariants[rightButton?.style || 'outline'],
    ];
  };

  const getButtonTextStyle = () => {
    const styleVariants = {
      primary: {
        color: '#FFFFFF',
      },
      secondary: {
        color: '#000000',
      },
      outline: {
        color: '#000000',
      },
    };

    return [styles.buttonText, styleVariants[rightButton?.style || 'outline']];
  };

  const renderContent = () => (
    <View style={styles.itemContainer}>
      <View style={styles.imageContainer}>
        <Image source={{uri: avatar}} style={styles.avatar} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {name} {surname}
        </Text>
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
      {rightButton && (
        <TouchableOpacity
          style={getButtonStyle()}
          onPress={rightButton.onPress}>
          <Text style={getButtonTextStyle()}>{rightButton.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress}>{renderContent()}</TouchableOpacity>
  ) : (
    renderContent()
  );
};

export const MemberStackedList: React.FC<MemberStackedListProps> = ({
  members,
  onMemberPress,
  layout = 'vertical',
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
      {members.map((member, index) => (
        <View
          key={member.id}
          style={[
            styles.cardWrapper,
            layout === 'vertical' && styles.verticalCardWrapper,
          ]}>
          <MemberStackedListItem
            {...member}
            onPress={() => onMemberPress?.(index)}
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
    paddingVertical: 4,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: 16,
  },
  verticalCardWrapper: {
    width: '100%',
    marginRight: 0,
    marginBottom: 0,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 8,
  },
  imageContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666666',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
