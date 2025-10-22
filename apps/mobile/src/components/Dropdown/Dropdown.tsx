import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
  ScrollView,
  Modal,
  Dimensions,
  TextInput,
  KeyboardEvent,
} from 'react-native';
import {
  createStyles,
  modalStyles,
  createAnimatedLabelStyle,
} from './Dropdown.styles';
import {DropdownItem, DropdownProps} from './types';
import {colors} from '@theme';
import {Icon} from '@components';
import {useTranslation} from '@hooks/useTranslation';

const Dropdown: React.FC<DropdownProps> = ({
  data,
  label,
  placeholder,
  selectedItem,
  onSelect,
  renderItem,
  renderNoResults,
  searchProperty = 'label',
  searchQuery: _searchQuery,
  onSearchQueryChange: _onSearchQueryChange,
  maxHeight,
  disabled = false,
  error,
  containerStyle,
  dropdownStyle: _dropdownStyle,
  inputStyle,
  itemStyle,
  helperText,
  loading = false,
  initiallyOpen = false,
  windowSize: _windowSize = 10,
  onClose,
  onOpen,
  testID,
  showClearButton = true,
  searchable = false,
}) => {
  const {t} = useTranslation();
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [isFocused, setIsFocused] = useState(false);
  const [modalPosition, setModalPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<ScrollView>(null);
  const inputWrapperRef = useRef<View>(null);
  const searchInputRef = useRef<TextInput>(null);
  const animatedIsFocused = useRef(
    new Animated.Value(selectedItem?.label ? 1 : 0),
  ).current;

  // Search state for searchable dropdown
  const [searchQuery, setSearchQuery] = useState(_searchQuery || '');

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e: KeyboardEvent) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Update modal position when keyboard shows
        if (isOpen) {
          setTimeout(updateModalPosition, 100);
        }
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        // Update modal position when keyboard hides
        if (isOpen) {
          setTimeout(updateModalPosition, 100);
        }
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [isOpen]);

  // Animation effect for label
  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || selectedItem?.label ? 1 : 0,
      duration: 200, // ANIMATION_DURATION
      useNativeDriver: false,
    }).start();
  }, [animatedIsFocused, isFocused, selectedItem]);

  // Handle search query change
  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    if (_onSearchQueryChange) {
      _onSearchQueryChange(query);
    }
  };

  // Clear search query
  const clearSearchQuery = () => {
    setSearchQuery('');
    if (_onSearchQueryChange) {
      _onSearchQueryChange('');
    }
  };

  // Calculate modal position
  const updateModalPosition = () => {
    if (inputWrapperRef.current && isOpen) {
      inputWrapperRef.current.measureInWindow((x, y, width, height) => {
        // Adjust position based on device dimensions and keyboard height
        const windowHeight = Dimensions.get('window').height;
        const availableHeight = windowHeight - keyboardHeight;
        const remainingSpace = availableHeight - y - height;
        const dropdownHeight = Math.min(maxHeight || 200, remainingSpace - 20); // 20px buffer

        // If there's not enough space below, position above the input
        let finalTop = y + height;
        let finalHeight = dropdownHeight;

        if (remainingSpace < 100 && y > 150) {
          // Position above the input if there's more space above
          finalTop = y - Math.min(maxHeight || 200, y - 20);
          finalHeight = Math.min(maxHeight || 200, y - 20);
        }

        setModalPosition({
          top: finalTop,
          left: x,
          width: width,
          height: Math.max(finalHeight, 100), // Minimum height of 100
        });
      });
    }
  };

  // Handle layout changes
  const handleLayout = (_event: LayoutChangeEvent) => {
    if (isOpen) {
      updateModalPosition();
    }
  };

  // Handle dropdown visibility
  const openDropdown = useCallback(() => {
    if (disabled) {
      return;
    }

    setIsOpen(true);
    setIsFocused(true);

    if (onOpen) {
      onOpen();
    }

    // Update modal position after state change
    setTimeout(updateModalPosition, 50);

    // Focus search input if searchable
    if (searchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    // Scroll to selected item when dropdown opens
    setTimeout(() => {
      if (selectedItem?.id && flatListRef.current) {
        // This is a basic scroll - in a real implementation, you would
        // calculate the exact position of the selected item
        const selectedIndex = data.findIndex(
          item => item.id === selectedItem.id,
        );
        if (selectedIndex > 0) {
          // Approximate scroll position
          flatListRef.current.scrollTo({
            y: selectedIndex * 40, // Assuming each item is about 40px high
            animated: false,
          });
        }
      }
    }, 100);
  }, [disabled, onOpen, selectedItem, data, isOpen]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setIsFocused(false);
    if (searchable) {
      clearSearchQuery();
      // Only dismiss keyboard if search input is not focused
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
    if (onClose) {
      onClose();
    }
    // Don't automatically dismiss keyboard for searchable dropdowns
    if (!searchable) {
      Keyboard.dismiss();
    }
  }, [onClose, searchable, clearSearchQuery]);

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }, [isOpen, openDropdown, closeDropdown]);

  // Get display text for selected item
  const getSelectedText = () => {
    if (
      selectedItem &&
      selectedItem[searchProperty as keyof typeof selectedItem]
    ) {
      return selectedItem[searchProperty as keyof typeof selectedItem];
    }
    return '';
  };

  // Filter data based on search query
  const filteredData =
    searchable && searchQuery.trim()
      ? data.filter(item => {
          const searchValue = item[searchProperty as keyof typeof item];
          return (
            searchValue &&
            searchValue
              .toString()
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          );
        })
      : data;

  // Handle item selection
  const handleSelect = (item: DropdownItem) => {
    onSelect(item);
    if (searchable) {
      clearSearchQuery();
    }
    closeDropdown();
  };

  // Clear selection
  const handleClear = () => {
    onSelect(null);
    if (searchable) {
      clearSearchQuery();
    }
  };

  // Create styles
  const styles = createStyles({
    isOpen,
    maxHeight,
    hasError: !!error,
    disabled,
  });

  // Create animated label style
  const labelStyle = createAnimatedLabelStyle(animatedIsFocused, isOpen, error);

  // Handle label press to focus the input
  const handleLabelPress = () => {
    openDropdown();
  };

  // Update position when window dimensions or keyboard height change
  useEffect(() => {
    if (isOpen) {
      updateModalPosition();
    }
  }, [
    isOpen,
    keyboardHeight,
    Dimensions.get('window').width,
    Dimensions.get('window').height,
  ]);

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {/* Input field with animated label */}
      <View
        style={styles.inputWrapper}
        ref={inputWrapperRef}
        onLayout={handleLayout}>
        {/* Animated Label */}
        {label && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleLabelPress}
            style={styles.touchableLabel}>
            <Animated.Text style={labelStyle}>{label}</Animated.Text>
          </TouchableOpacity>
        )}

        {/* Make the entire container clickable */}
        <TouchableOpacity
          activeOpacity={disabled ? 1 : 0.7}
          onPress={toggleDropdown}
          disabled={disabled}
          style={styles.fullWidth}>
          <View style={[styles.inputContainer, inputStyle]}>
            {/* Display selected value or placeholder */}
            <View style={styles.selectedItemContainer}>
              <Text
                style={[
                  styles.selectedItemText,
                  {
                    color: selectedItem
                      ? colors.neutral.black
                      : colors.neutral.grey,
                  },
                ]}>
                {getSelectedText() || placeholder}
              </Text>
            </View>

            {/* Clear button */}
            {showClearButton && selectedItem && selectedItem.id ? (
              <TouchableOpacity
                onPress={handleClear}
                style={styles.clearButton}>
                <Icon name="close" size={16} color={colors.neutral.grey} />
              </TouchableOpacity>
            ) : null}

            {/* Dropdown toggle icon */}
            <TouchableOpacity
              onPress={toggleDropdown}
              style={styles.iconContainer}
              disabled={disabled}>
              <Icon
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={
                  disabled ? colors.neutral.lightGrey : colors.neutral.grey
                }
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Dropdown list using Modal for overlay */}
        <Modal
          visible={isOpen}
          transparent={true}
          animationType="none"
          onRequestClose={closeDropdown}>
          <TouchableOpacity
            style={modalStyles.backdrop}
            activeOpacity={1}
            onPress={closeDropdown}>
            <View
              style={[
                modalStyles.dropdownContainer,
                {
                  top: modalPosition.top,
                  left: modalPosition.left,
                  width: modalPosition.width,
                  maxHeight: modalPosition.height,
                },
              ]}>
              {/* Search input for searchable dropdown */}
              {searchable && (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {}} // Prevent backdrop close when touching search area
                  style={styles.searchContainer}>
                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    placeholder={t('components.dropdown.search_placeholder')}
                    value={searchQuery}
                    onChangeText={handleSearchQueryChange}
                    autoCorrect={false}
                    autoCapitalize="none"
                    onFocus={() => {
                      // Update position when search input is focused
                      setTimeout(updateModalPosition, 100);
                    }}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={clearSearchQuery}
                      style={styles.searchClearButton}>
                      <Icon
                        name="close"
                        size={16}
                        color={colors.neutral.grey}
                      />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              )}
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={colors.neutral.black} />
                </View>
              ) : filteredData.length === 0 ? (
                renderNoResults ? (
                  renderNoResults()
                ) : (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>
                      {searchable && searchQuery.trim()
                        ? t('components.dropdown.no_search_results')
                        : t('components.dropdown.no_results')}
                    </Text>
                  </View>
                )
              ) : (
                <ScrollView
                  ref={flatListRef}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={true}
                  style={styles.scrollViewContainer}
                  contentContainerStyle={styles.scrollViewContent}>
                  {filteredData.map(item => {
                    const isItemSelected =
                      selectedItem && selectedItem.id === item.id;

                    // If a custom render function is provided, use it
                    if (renderItem) {
                      return (
                        <TouchableOpacity
                          key={item.id.toString()}
                          onPress={() => handleSelect(item)}
                          style={[
                            styles.item,
                            isItemSelected && styles.selectedItem,
                            itemStyle,
                          ]}>
                          {renderItem(item)}
                        </TouchableOpacity>
                      );
                    }

                    // Default render implementation
                    return (
                      <TouchableOpacity
                        key={item.id.toString()}
                        onPress={() => handleSelect(item)}
                        style={[
                          styles.item,
                          isItemSelected && styles.selectedItem,
                          itemStyle,
                        ]}>
                        <Text
                          style={[
                            styles.itemText,
                            isItemSelected && styles.selectedItemText,
                          ]}>
                          {item[searchProperty as keyof typeof item]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      {/* Error or Helper text */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

export default Dropdown;
