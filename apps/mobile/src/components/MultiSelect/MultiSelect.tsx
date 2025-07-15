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
import {createStyles} from './MultiSelect.styles';
import {MultiSelectItem, MultiSelectProps} from './types';
import {colors, fontSizes, spacing} from '../../theme';
import {Icon} from '../Icon';
import {Chip} from '../Chip';
import {useTranslation} from '../../hooks/useTranslation';

// Animation constants
const ANIMATION_DURATION = 200;
const LABEL_LEFT_POSITION = spacing.md;
const LABEL_TOP_POSITION = spacing.md;

/**
 * A reusable MultiSelect dropdown component that allows selecting multiple items
 */
const MultiSelect: React.FC<MultiSelectProps> = ({
  data,
  label,
  placeholder,
  selectedItems = [],
  onSelectionChange,
  renderItem,
  renderNoResults,
  renderSelectedItem,
  searchProperty = 'label',
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
  maxHeight,
  maxSelectedItems = 3,
  disabled = false,
  error,
  containerStyle,
  dropdownStyle,
  inputStyle,
  itemStyle,
  chipStyle,
  chipTextStyle,
  helperText,
  loading = false,
  closeOnSelect = false,
  testID: _testID,
  searchable = false,
}) => {
  const {t} = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [_dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [maxItemsReached, setMaxItemsReached] = useState(
    selectedItems.length >= maxSelectedItems,
  );

  const inputRef = useRef<TextInput>(null);
  const dropdownRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputWrapperRef = useRef<View>(null);
  const animatedIsFocused = useRef(
    new Animated.Value(selectedItems.length > 0 || internalSearchQuery ? 1 : 0),
  ).current;

  // Check if max items limit is reached
  useEffect(() => {
    setMaxItemsReached(selectedItems.length >= maxSelectedItems);
  }, [selectedItems, maxSelectedItems]);

  // Use external search query if provided (controlled component)
  const searchQuery =
    externalSearchQuery !== undefined
      ? externalSearchQuery
      : internalSearchQuery;

  // Animation effect for label
  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || searchQuery || selectedItems.length > 0 ? 1 : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: false,
    }).start();
  }, [animatedIsFocused, isFocused, searchQuery, selectedItems]);

  // Filter items based on search query
  const filteredItems = data.filter(item => {
    // When dropdown is open and there are selectedItems but no search query,
    // we want to show all items with selected ones highlighted
    if ((isOpen && selectedItems.length > 0 && !searchQuery) || !searchable) {
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

    // Clear search query when opening to show all items
    if (selectedItems.length > 0 && !isOpen) {
      setInternalSearchQuery('');
    }

    // Focus the input when dropdown opens if searchable
    if (inputRef.current && searchable) {
      inputRef.current.focus();
    }

    // Update dropdown position after state change
    setTimeout(updateDropdownPosition, 0);
  }, [disabled, selectedItems, isOpen, searchable]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setIsFocused(false);
    Keyboard.dismiss();
  }, []);

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

  // Check if an item is selected
  const isItemSelected = (item: MultiSelectItem): boolean => {
    return selectedItems.some(selected => selected.id === item.id);
  };

  // Handle item selection
  const handleSelect = (item: MultiSelectItem) => {
    let newSelectedItems: MultiSelectItem[];

    if (isItemSelected(item)) {
      // Remove item if already selected
      newSelectedItems = selectedItems.filter(
        selected => selected.id !== item.id,
      );
    } else {
      // Add item if not selected and under the limit
      if (selectedItems.length < maxSelectedItems) {
        newSelectedItems = [...selectedItems, item];
      } else {
        // Max items already selected - don't add more
        return;
      }
    }

    onSelectionChange(newSelectedItems);

    if (closeOnSelect) {
      closeDropdown();
    } else {
      // Focus back on the search input
      if (inputRef.current && searchable) {
        inputRef.current.focus();
      }
    }
  };

  // Handle removing a selected item
  const handleRemoveItem = (item: MultiSelectItem) => {
    const newSelectedItems = selectedItems.filter(
      selected => selected.id !== item.id,
    );
    onSelectionChange(newSelectedItems);
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

  // Render a selected item chip/tag
  const renderChip = (item: MultiSelectItem) => {
    if (renderSelectedItem) {
      return renderSelectedItem(item, () => handleRemoveItem(item));
    }

    return (
      <Chip
        key={item.id}
        label={item.label}
        onRemove={() => handleRemoveItem(item)}
        style={chipStyle}
        labelStyle={chipTextStyle}
        removable={true}
        onPress={() => toggleDropdown()}
        size="small"
        variant="filled"
        color="secondary"
      />
    );
  };

  // Get helper or error text to display
  const getDisplayText = () => {
    if (error) {
      return error;
    }

    if (maxItemsReached && isOpen) {
      return t('components.multiSelect.maxItemsReached', {
        count: maxSelectedItems,
      });
    }

    return helperText || '';
  };

  // Determine if an item should be disabled
  const isItemDisabled = (item: MultiSelectItem): boolean => {
    return maxItemsReached && !isItemSelected(item);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={styles.inputWrapper}
        ref={inputWrapperRef}
        onLayout={handleLayout}>
        {/* Animated Label */}
        {label && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleLabelPress}
            disabled={disabled}
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
            {/* Always show selected items as chips */}
            <View style={styles.flexContainer}>
              {selectedItems.length > 0 && (
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  style={styles.chipScrollView}
                  contentContainerStyle={styles.selectedItemContainer}>
                  {selectedItems.map(item => renderChip(item))}
                </ScrollView>
              )}

              {/* Search input always visible */}
              <TextInput
                ref={inputRef}
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholder={isFocused || !label ? placeholder : ''}
                placeholderTextColor={colors.neutral.grey}
                style={[styles.input]}
                editable={!disabled && isOpen && searchable}
                onFocus={openDropdown}
                onBlur={() => setIsFocused(false)}
                pointerEvents={isOpen && searchable ? 'auto' : 'none'}
              />
            </View>

            {/* Dropdown arrow icon */}
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={toggleDropdown}
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

        {/* Dropdown List */}
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
                marginTop: 2,
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
                    {t('components.multiSelect.noResults')}
                  </Text>
                </View>
              )
            ) : (
              <ScrollView
                ref={scrollViewRef}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                style={{maxHeight: maxHeight || 200}}>
                {filteredItems.map(item => {
                  const isSelected = isItemSelected(item);
                  const disabled = isItemDisabled(item);

                  // If a custom render function is provided, use it
                  if (renderItem) {
                    return (
                      <TouchableOpacity
                        key={item.id.toString()}
                        onPress={() => handleSelect(item)}
                        style={[
                          styles.item,
                          isSelected && styles.selectedItem,
                          itemStyle,
                        ]}
                        disabled={disabled}>
                        {renderItem(item, isSelected)}
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
                        isSelected && styles.selectedItem,
                        itemStyle,
                      ]}
                      disabled={disabled}>
                      <Text
                        style={[
                          styles.itemText,
                          disabled && styles.disabledText,
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
      {getDisplayText() ? (
        <Text
          style={[
            error ? styles.errorText : styles.helperText,
            maxItemsReached && isOpen && !error ? styles.maxItemsText : null,
          ]}>
          {getDisplayText()}
        </Text>
      ) : null}
    </View>
  );
};

export default MultiSelect;
