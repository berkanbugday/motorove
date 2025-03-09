import React from 'react';
import {
  StyleSheet,
  Platform,
  TextInput,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import {View, Text} from 'react-native-ui-lib';
import {SafeAreaView} from 'react-native-safe-area-context';
import {getDefaultHeaderHeight} from '@react-navigation/elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 0;

// Configure custom animation
const CustomLayoutAnimation = {
  duration: 200,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
};

interface HeaderProps {
  title: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  headerHeight?: number;
  backgroundColor?: string;
  showHeader?: boolean;
  onSearch?: (text: string) => void;
  onSubmitSearch?: (text: string) => void;
  onClearSearch?: () => void;
  onCloseSearch?: () => void;
}

export const Header = ({
  title,
  leftComponent,
  rightComponent,
  headerHeight = getDefaultHeaderHeight(
    {
      height: STATUSBAR_HEIGHT + APPBAR_HEIGHT,
      width: 0,
    },
    false,
    0,
  ),
  backgroundColor = '#FFFFFF',
  showHeader = true,
  onSearch,
  onSubmitSearch,
  onClearSearch,
  onCloseSearch,
}: HeaderProps): React.ReactElement => {
  const [isSearchActive, setIsSearchActive] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const searchInputRef = React.useRef<TextInput>(null);
  const searchOpacity = React.useRef(new Animated.Value(0)).current;
  const headerOpacity = React.useRef(
    new Animated.Value(showHeader ? 1 : 0),
  ).current;

  React.useEffect(() => {
    if (!isSearchActive) {
      Keyboard.dismiss();
    }
  }, [isSearchActive]);

  React.useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: showHeader ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showHeader, headerOpacity]);

  const handleSearchPress = () => {
    setIsSearchActive(true);
    // Trigger layout animation first
    LayoutAnimation.configureNext(CustomLayoutAnimation);

    // Start opacity animation immediately
    Animated.timing(searchOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();

    // Focus and show keyboard with a slight delay to ensure smooth animation
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleSearchClose = () => {
    Keyboard.dismiss();
    Animated.timing(searchOpacity, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      LayoutAnimation.configureNext(CustomLayoutAnimation);
      setIsSearchActive(false);
      setSearchText('');
      onCloseSearch?.();
    });
  };

  const handleClearSearch = () => {
    setSearchText('');
    searchInputRef.current?.focus();
    onClearSearch?.();
  };

  const handleSubmitSearch = () => {
    if (searchText.trim()) {
      onSubmitSearch?.(searchText.trim());
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView edges={['top']} style={{backgroundColor}}>
        <Animated.View
          style={[
            styles.header,
            {
              height: headerHeight,
              opacity: headerOpacity,
            },
            !showHeader && styles.headerHidden,
          ]}>
          <View
            style={[styles.left, !isSearchActive && styles.leftVisible]}
            center>
            {!isSearchActive
              ? leftComponent ||
                (onSearch && (
                  <TouchableOpacity onPress={handleSearchPress}>
                    <Icon name="magnify" size={24} color="#000000" />
                  </TouchableOpacity>
                ))
              : null}
          </View>
          {!isSearchActive ? (
            <>
              <View style={styles.titleContainer} center>
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
              </View>
              <View style={styles.right} center>
                {rightComponent}
              </View>
            </>
          ) : (
            <Animated.View
              style={[
                styles.searchContainer,
                {
                  opacity: searchOpacity,
                  transform: [
                    {
                      scale: searchOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1],
                      }),
                    },
                  ],
                },
              ]}>
              <View style={styles.searchInputContainer}>
                <TouchableOpacity onPress={handleSubmitSearch}>
                  <Icon
                    name="magnify"
                    size={20}
                    color="#8E8E93"
                    style={styles.searchIcon}
                  />
                </TouchableOpacity>
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search..."
                  value={searchText}
                  onChangeText={text => {
                    setSearchText(text);
                    onSearch?.(text);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  enablesReturnKeyAutomatically
                  onSubmitEditing={handleSubmitSearch}
                />
                {searchText ? (
                  <TouchableOpacity
                    onPress={handleClearSearch}
                    style={styles.clearButton}>
                    <Icon name="close-circle" size={20} color="#8E8E93" />
                  </TouchableOpacity>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={handleSearchClose}
                style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  headerHidden: {
    height: 0,
    paddingVertical: 0,
  },
  left: {
    width: 0,
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  leftVisible: {
    width: 40,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 17 : 20,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    color: Platform.select({
      ios: '#000000',
      android: '#000000',
      default: '#000000',
    }),
  },
  right: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    height: 36,
  },
  searchIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#000000',
  },
  clearButton: {
    padding: 8,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
