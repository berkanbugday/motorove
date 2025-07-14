import {TextStyle, ViewStyle} from 'react-native';

/**
 * Represents an item in the MultiSelect dropdown
 */
export interface MultiSelectItem {
  /**
   * Unique identifier for the item
   */
  id: string | number;

  /**
   * Display label for the item
   */
  label: string;

  /**
   * Optional value, useful when working with enums
   */
  value?: string;
}

/**
 * Props for the MultiSelect component
 */
export interface MultiSelectProps {
  /**
   * Array of items to display in the dropdown
   */
  data: MultiSelectItem[];

  /**
   * Label for the dropdown field
   */
  label?: string;

  /**
   * Placeholder text to display when no items are selected
   */
  placeholder?: string;

  /**
   * Currently selected items
   */
  selectedItems: MultiSelectItem[];

  /**
   * Callback function when selection changes
   * Returns the complete array of selected items
   */
  onSelectionChange: (items: MultiSelectItem[]) => void;

  /**
   * Optional custom render function for list items
   */
  renderItem?: (item: MultiSelectItem, isSelected: boolean) => React.ReactNode;

  /**
   * Optional function to render when no results are found
   */
  renderNoResults?: () => React.ReactNode;

  /**
   * Optional function to render the selected items chips/tags
   */
  renderSelectedItem?: (
    item: MultiSelectItem,
    onRemove: () => void,
  ) => React.ReactNode;

  /**
   * Optional property to search on (defaults to 'label')
   */
  searchProperty?: keyof MultiSelectItem;

  /**
   * Optional search query for controlled usage
   */
  searchQuery?: string;

  /**
   * Callback when search query changes
   */
  onSearchQueryChange?: (query: string) => void;

  /**
   * Maximum height for the dropdown list
   */
  maxHeight?: number;

  /**
   * Maximum number of items that can be selected
   * Defaults to 3
   */
  maxSelectedItems?: number;

  /**
   * Whether the component is disabled
   */
  disabled?: boolean;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Helper text to display below the dropdown
   */
  helperText?: string;

  /**
   * Whether the component is in loading state
   */
  loading?: boolean;

  /**
   * Optional styles for the container
   */
  containerStyle?: ViewStyle;

  /**
   * Optional styles for the dropdown
   */
  dropdownStyle?: ViewStyle;

  /**
   * Optional styles for the input field
   */
  inputStyle?: ViewStyle;

  /**
   * Optional styles for list items
   */
  itemStyle?: ViewStyle;

  /**
   * Optional styles for selected item chips/tags
   */
  chipStyle?: ViewStyle;

  /**
   * Optional styles for chip/tag text
   */
  chipTextStyle?: TextStyle;

  /**
   * Whether to close dropdown after each selection
   * Defaults to false for multi-select behavior
   */
  closeOnSelect?: boolean;

  /**
   * Test ID for component testing
   */
  testID?: string;

  /**
   * Whether the component is searchable
   * Defaults to true
   */
  searchable?: boolean;
}
