import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ViewStyle,
  Animated,
  Dimensions,
} from 'react-native';
import {styles} from './DropdownMenu.styles';
import {Icon, IconName} from '../Icon';
import {colors} from '@theme';

export interface DropdownMenuItem {
  /**
   * Unique identifier for the menu item
   */
  id: string;

  /**
   * Label text to display
   */
  label: string;

  /**
   * Optional icon to display
   */
  icon?: IconName;

  /**
   * Whether this item is highlighted (e.g., in a different color)
   */
  isHighlighted?: boolean;

  /**
   * Whether this item is disabled
   */
  isDisabled?: boolean;
}

export interface DropdownMenuProps {
  /**
   * Array of menu items
   */
  items: DropdownMenuItem[];

  /**
   * The component that will trigger the dropdown
   */
  triggerComponent?: React.ReactNode;

  /**
   * Icon name for the trigger button (if no triggerComponent is provided)
   */
  triggerIcon?: IconName;

  /**
   * Icon size for the trigger button
   */
  triggerIconSize?: number;

  /**
   * Icon color for the trigger button
   */
  triggerIconColor?: string;

  /**
   * Function to call when a menu item is selected
   */
  onSelect: (item: DropdownMenuItem) => void;

  /**
   * Position of the dropdown relative to the trigger
   */
  position?: 'top' | 'bottom' | 'left' | 'right';

  /**
   * Optional custom styles for the dropdown container
   */
  containerStyle?: ViewStyle;

  /**
   * Optional custom styles for the dropdown items
   */
  itemStyle?: ViewStyle;

  /**
   * Whether to close the dropdown when an item is selected
   */
  closeOnSelect?: boolean;

  /**
   * Additional props for testing
   */
  testID?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  triggerComponent,
  triggerIcon = 'more-vertical',
  triggerIconSize = 24,
  triggerIconColor = colors.neutral.grey,
  onSelect,
  position = 'bottom',
  containerStyle,
  itemStyle,
  closeOnSelect = true,
  testID,
}) => {
  const [visible, setVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const triggerRef = useRef<View>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    if (visible) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const openDropdown = () => {
    measureTriggerPosition();
    setVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const closeDropdown = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  const handleSelect = (item: DropdownMenuItem) => {
    if (item.isDisabled) {
      return;
    }

    onSelect(item);

    if (closeOnSelect) {
      closeDropdown();
    }
  };

  const measureTriggerPosition = () => {
    if (triggerRef.current) {
      triggerRef.current.measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          const windowWidth = Dimensions.get('window').width;
          const windowHeight = Dimensions.get('window').height;

          // Calculate position based on the `position` prop
          let top = 0;
          let left = 0;

          switch (position) {
            case 'top':
              top = y - 150; // Adjust this value based on your dropdown height
              left = x - width / 2;
              break;
            case 'bottom':
              top = y + height;
              left = x - width / 2;
              break;
            case 'left':
              top = y;
              left = x - 150; // Adjust this value based on your dropdown width
              break;
            case 'right':
              top = y;
              left = x + width;
              break;
            default:
              top = y + height;
              left = x - width / 2;
          }

          // Ensure the dropdown doesn't go off-screen
          if (left < 10) {
            left = 10;
          } else if (left + 150 > windowWidth) {
            // Adjust based on dropdown width
            left = windowWidth - 160;
          }

          if (top < 10) {
            top = 10;
          } else if (top + 200 > windowHeight) {
            // Adjust based on dropdown height
            top = windowHeight - 210;
          }

          setDropdownPosition({
            top,
            left,
            width: width,
          });
        },
      );
    }
  };

  useEffect(() => {
    return () => {
      // Clean up animation when component unmounts
      fadeAnim.setValue(0);
    };
  }, [fadeAnim]);

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        onPress={toggleDropdown}
        testID={testID}>
        {triggerComponent || (
          <Icon
            name={triggerIcon}
            size={triggerIconSize}
            color={triggerIconColor}
          />
        )}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={closeDropdown}>
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.dropdown,
                containerStyle,
                {
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  opacity: fadeAnim,
                  transform: [
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                },
              ]}>
              {items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    index === 0 && styles.firstMenuItem,
                    index === items.length - 1 && styles.lastMenuItem,
                    item.isHighlighted && styles.highlightedItem,
                    item.isDisabled && styles.disabledItem,
                    itemStyle,
                  ]}
                  onPress={() => handleSelect(item)}
                  disabled={item.isDisabled}
                  activeOpacity={item.isDisabled ? 1 : 0.6}>
                  {item.icon && (
                    <Icon
                      name={item.icon}
                      size={18}
                      color={
                        item.isDisabled
                          ? colors.neutral.lightGrey
                          : item.isHighlighted
                          ? colors.status.error
                          : colors.neutral.black
                      }
                      style={styles.itemIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.itemText,
                      item.isHighlighted && styles.highlightedText,
                      item.isDisabled && styles.disabledText,
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default DropdownMenu;
