import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  Animated,
  LayoutChangeEvent,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import {createStyles} from './MultiSelect.styles';
import {MultiSelectItem, MultiSelectProps} from './types';
import {colors} from '../../theme';
import {Icon} from '../Icon';
import {Chip} from '../Chip';
import {LoadingIndicator} from '../LoadingIndicator';
import {useTranslation} from '../../hooks/useTranslation';

// Animation constants
const ANIMATION_DURATION = 200;

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
  searchQuery: _searchQuery,
  onSearchQueryChange: _onSearchQueryChange,
  maxHeight,
  maxSelectedItems = 3,
  disabled = false,
  error,
  containerStyle,
  dropdownStyle: _dropdownStyle,
  inputStyle,
  itemStyle,
  chipStyle,
  chipTextStyle,
  helperText,
  loading = false,
  closeOnSelect = false,
  testID: _testID,
}) => {
  const {t} = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [modalPosition, setModalPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [maxItemsReached, setMaxItemsReached] = useState(
    selectedItems.length >= maxSelectedItems,
  );

  const scrollViewRef = useRef<ScrollView>(null);
  const inputWrapperRef = useRef<View>(null);
  const animatedIsFocused = useRef(
    new Animated.Value(selectedItems.length > 0 ? 1 : 0),
  ).current;

  // Check if max items limit is reached
  useEffect(() => {
    setMaxItemsReached(selectedItems.length >= maxSelectedItems);
  }, [selectedItems, maxSelectedItems]);

  // Animation effect for label
  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || selectedItems.length > 0 ? 1 : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: false,
    }).start();
  }, [animatedIsFocused, isFocused, selectedItems]);

  // Calculate modal position
  const updateModalPosition = () => {
    if (inputWrapperRef.current && isOpen) {
      inputWrapperRef.current.measureInWindow((x, y, width, height) => {
        // Adjust position based on device dimensions
        const windowHeight = Dimensions.get('window').height;
        const remainingSpace = windowHeight - y - height;
        const dropdownHeight = Math.min(maxHeight || 200, remainingSpace - 10); // 10px buffer

        setModalPosition({
          top: y + height,
          left: x,
          width: width,
          height: dropdownHeight,
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

    // Update modal position after state change
    setTimeout(updateModalPosition, 50);
  }, [disabled]);

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
  const {styles, labelStyle, modalStyles} = createStyles({
    isOpen,
    maxHeight,
    hasError: !!error,
    disabled,
    error,
    modalPosition,
    animatedIsFocused,
  });

  // Handle label press to focus the input
  const handleLabelPress = () => {
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
      return t('components.multiSelect.max_items_reached', {
        count: maxSelectedItems,
      });
    }

    return helperText || '';
  };

  // Determine if an item should be disabled
  const isItemDisabled = (item: MultiSelectItem): boolean => {
    return maxItemsReached && !isItemSelected(item);
  };

  // Handle the click on a disabled item - prevent propagation
  const handleDisabledItemPress = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
  };

  // Update position when window dimensions change
  useEffect(() => {
    if (isOpen) {
      updateModalPosition();
    }
  }, [isOpen, Dimensions.get('window').width, Dimensions.get('window').height]);

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
            {/* Show selected items as chips */}
            <View style={styles.flexContainer}>
              {selectedItems.length > 0 ? (
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  style={styles.chipScrollView}
                  contentContainerStyle={styles.selectedItemContainer}>
                  {selectedItems.map(item => renderChip(item))}
                </ScrollView>
              ) : (
                <Text style={styles.placeholder}>{placeholder}</Text>
              )}
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
              style={modalStyles.dropdownContainer}
              onStartShouldSetResponder={() => true}
              onTouchEnd={e => e.stopPropagation()}>
              {loading ? (
                <LoadingIndicator visible={true} />
              ) : data.length === 0 ? (
                renderNoResults ? (
                  renderNoResults()
                ) : (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>
                      {t('components.multiSelect.no_results')}
                    </Text>
                  </View>
                )
              ) : (
                <ScrollView
                  ref={scrollViewRef}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}>
                  {data.map(item => {
                    const isSelected = isItemSelected(item);
                    const isDisabled = isItemDisabled(item);

                    // If a custom render function is provided, use it
                    if (renderItem) {
                      return (
                        <TouchableOpacity
                          key={item.id.toString()}
                          onPress={
                            isDisabled
                              ? handleDisabledItemPress
                              : () => handleSelect(item)
                          }
                          style={[
                            styles.item,
                            isSelected && styles.selectedItem,
                            itemStyle,
                          ]}
                          activeOpacity={isDisabled ? 1 : 0.7}>
                          {renderItem(item, isSelected)}
                        </TouchableOpacity>
                      );
                    }

                    // Default render implementation
                    return (
                      <TouchableOpacity
                        key={item.id.toString()}
                        onPress={
                          isDisabled
                            ? handleDisabledItemPress
                            : () => handleSelect(item)
                        }
                        style={[
                          styles.item,
                          isSelected && styles.selectedItem,
                          itemStyle,
                        ]}
                        activeOpacity={isDisabled ? 1 : 0.7}>
                        <Text
                          style={[
                            styles.itemText,
                            isDisabled && styles.disabledText,
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
