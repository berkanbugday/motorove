import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  Animated,
  TextStyle,
  LayoutChangeEvent,
  ScrollView,
} from 'react-native';
import {createStyles} from './Dropdown.styles';
import {DropdownItem, DropdownProps} from './types';
import {colors, fontSizes, spacing} from '@theme';
import {Icon} from '@components/Icon';
import {useTranslation} from '../../hooks/useTranslation';

// Animation constants
const ANIMATION_DURATION = 200;
const LABEL_LEFT_POSITION = spacing.md;
const LABEL_TOP_POSITION = spacing.md;

const Dropdown: React.FC<DropdownProps> = ({
  data,
  label,
  placeholder,
  selectedItem,
  onSelect,
  renderItem,
  renderNoResults,
  searchProperty = 'label',
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
  maxHeight,
  disabled = false,
  error,
  containerStyle,
  dropdownStyle,
  inputStyle,
  itemStyle,
  helperText,
  loading = false,
  initiallyOpen = false,
  windowSize: _windowSize = 10,
  onClose,
  onOpen,
  testID,
  searchable = true,
  showClearButton = true,
}) => {
  const {t} = useTranslation();
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [_dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const inputRef = useRef<TextInput>(null);
  const dropdownRef = useRef<View>(null);
  const flatListRef = useRef<ScrollView>(null);
  const inputWrapperRef = useRef<View>(null);
  const animatedIsFocused = useRef(
    new Animated.Value(selectedItem?.label || internalSearchQuery ? 1 : 0),
  ).current;

  // Use external search query if provided (controlled component)
  const searchQuery =
    externalSearchQuery !== undefined
      ? externalSearchQuery
      : internalSearchQuery;

  // Animation effect for label
  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || searchQuery || selectedItem?.label ? 1 : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: false,
    }).start();
  }, [animatedIsFocused, isFocused, searchQuery, selectedItem]);

  // Filter items based on search query
  const filteredItems = data.filter(item => {
    // When dropdown is open and a selectedItem exists but no search query,
    // we want to show all items with the selected one highlighted
    if ((isOpen && selectedItem?.id && !searchQuery) || !searchable) {
      return true;
    }

    const searchPropertyValue = String(
      item[searchProperty as keyof typeof item] || '',
    ).toLowerCase();
    return searchPropertyValue.includes(searchQuery.toLowerCase());
  });

  // Update dropdown position when opening
  const updateDropdownPosition = () => {
    if (inputWrapperRef.current && isOpen) {
      inputWrapperRef.current.measureInWindow((x, y, width, height) => {
        setDropdownPosition({
          top: y + height + 2,
          left: x,
          width: width,
        });
      });
    }
  };

  // Handle layout changes
  const handleLayout = (_event: LayoutChangeEvent) => {
    if (isOpen) {
      updateDropdownPosition();
    }
  };

  // Handle dropdown visibility
  const openDropdown = useCallback(() => {
    if (disabled) {
      return;
    }

    setIsOpen(true);
    setIsFocused(true);

    // Clear search query when opening to show all items with selected item highlighted
    if (selectedItem?.id && !isOpen) {
      setInternalSearchQuery('');
    }

    if (onOpen) {
      onOpen();
    }
    // Focus the input when dropdown opens if searchable
    if (inputRef.current && searchable) {
      inputRef.current.focus();
    }

    // Update dropdown position after state change
    setTimeout(updateDropdownPosition, 0);

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
  }, [disabled, onOpen, selectedItem, data, isOpen, searchable]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setIsFocused(false);
    if (onClose) {
      onClose();
    }
    Keyboard.dismiss();
  }, [onClose]);

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }, [isOpen, openDropdown, closeDropdown]);

  // Handle search query change
  const handleSearchChange = (text: string) => {
    if (!searchable) {
      return;
    }

    if (onSearchQueryChange) {
      onSearchQueryChange(text);
    } else {
      setInternalSearchQuery(text);
    }
  };

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

  // Handle item selection
  const handleSelect = (item: DropdownItem) => {
    onSelect(item);
    closeDropdown();
    setInternalSearchQuery('');
  };

  // Clear selection
  const handleClear = () => {
    onSelect(null);
    setInternalSearchQuery('');
    if (inputRef.current && searchable) {
      inputRef.current.focus();
    }
  };

  // Create styles
  const styles = createStyles({
    isOpen,
    maxHeight,
    hasError: !!error,
    disabled,
  });

  // Animated label style
  const labelStyle: Animated.AnimatedProps<TextStyle> = {
    position: 'absolute',
    left: LABEL_LEFT_POSITION,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [LABEL_TOP_POSITION, -10],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [fontSizes.sm, fontSizes.xs],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [
        colors.neutral.grey,
        error
          ? colors.status.error
          : isOpen
          ? colors.neutral.black
          : colors.neutral.black,
      ],
    }),
    fontWeight: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ['500', '600'],
    }),
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 4,
    zIndex: 5,
  };

  // Handle label press to focus the input
  const handleLabelPress = () => {
    if (inputRef.current && searchable) {
      inputRef.current.focus();
    }
    openDropdown();
  };

  // Update position when opening dropdown
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
    }
  }, [isOpen]);

  const defaultPlaceholder = placeholder || t('components.dropdown.search');

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
            style={{zIndex: 5}}>
            <Animated.Text style={labelStyle}>{label}</Animated.Text>
          </TouchableOpacity>
        )}

        {/* Make the entire container clickable */}
        <TouchableOpacity
          activeOpacity={disabled ? 1 : 0.7}
          onPress={toggleDropdown}
          disabled={disabled}
          style={{width: '100%'}}>
          <View style={[styles.inputContainer, inputStyle]}>
            {selectedItem && !isOpen ? (
              <View style={styles.selectedItemContainer}>
                <Text
                  style={[
                    styles.selectedItemText,
                    {color: colors.neutral.black},
                  ]}>
                  {getSelectedText()}
                </Text>
              </View>
            ) : (
              <TextInput
                ref={inputRef}
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholder={
                  selectedItem?.label && isOpen
                    ? selectedItem.label
                    : isFocused || !label
                    ? defaultPlaceholder
                    : ''
                }
                placeholderTextColor={colors.neutral.grey}
                style={[
                  styles.input,
                  selectedItem?.label && isOpen
                    ? {color: colors.neutral.black}
                    : {},
                ]}
                editable={!disabled && isOpen && searchable}
                onFocus={openDropdown}
                onBlur={() => setIsFocused(false)}
                pointerEvents={isOpen && searchable ? 'auto' : 'none'}
              />
            )}

            {/* Clear button */}
            {showClearButton &&
            ((isOpen && searchQuery && searchable) ||
              (!isOpen && selectedItem && selectedItem.id)) ? (
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

        {/* Dropdown list right after the input wrapper */}
        {isOpen && (
          <View
            ref={dropdownRef}
            style={[
              styles.dropdown,
              dropdownStyle,
              {
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '100%',
                zIndex: 1000,
                elevation: 5,
                marginTop: 0,
              },
            ]}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.neutral.black} />
              </View>
            ) : filteredItems.length === 0 ? (
              renderNoResults ? (
                renderNoResults()
              ) : (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>
                    {t('components.dropdown.no_results')}
                  </Text>
                </View>
              )
            ) : (
              <ScrollView
                ref={flatListRef}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                style={{maxHeight: maxHeight || 200}}>
                {filteredItems.map(item => {
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
        )}
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
