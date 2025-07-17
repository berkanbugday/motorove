/**
 * Dropdown types
 */

export interface DropdownItem {
  id: string | number;
  label: string;
  value: any;
  [key: string]: any; // Allow for additional properties
}

export interface DropdownProps {
  /**
   * Array of items to display in the dropdown
   */
  data: DropdownItem[];

  /**
   * Label for the dropdown
   */
  label?: string;

  /**
   * Placeholder text to display in the search input
   */
  placeholder?: string;

  /**
   * Currently selected item
   */
  selectedItem?: DropdownItem | null;

  /**
   * Callback function when an item is selected
   */
  onSelect: (item: DropdownItem | null) => void;

  /**
   * Optional custom render function for list items
   */
  renderItem?: (item: DropdownItem) => React.ReactNode;

  /**
   * Optional function to render when no results are found
   */
  renderNoResults?: () => React.ReactNode;

  /**
   * Property to search on (defaults to 'label')
   */
  searchProperty?: keyof DropdownItem;

  /**
   * Optional search query for controlled usage
   */
  searchQuery?: string;

  /**
   * Callback when search query changes
   */
  onSearchQueryChange?: (query: string) => void;

  /**
   * Maximum height for the dropdown list (in pixels)
   */
  maxHeight?: number;

  /**
   * Whether the dropdown is disabled
   */
  disabled?: boolean;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Optional styles to apply to the container
   */
  containerStyle?: object;

  /**
   * Optional styles to apply to the dropdown
   */
  dropdownStyle?: object;

  /**
   * Optional styles to apply to the input
   */
  inputStyle?: object;

  /**
   * Optional styles to apply to list items
   */
  itemStyle?: object;

  /**
   * Helper text to display below the dropdown
   */
  helperText?: string;

  /**
   * Whether the dropdown is in loading state
   */
  loading?: boolean;

  /**
   * Whether to show the dropdown initially
   */
  initiallyOpen?: boolean;

  /**
   * Number of items to render at once in the list
   */
  windowSize?: number;

  /**
   * Action to perform when dropdown is closed
   */
  onClose?: () => void;

  /**
   * Action to perform when dropdown is opened
   */
  onOpen?: () => void;

  /**
   * Optional test ID for UI testing
   */
  testID?: string;

  /**
   * Whether to show the clear button when an item is selected or search text exists
   * Default is true
   */
  showClearButton?: boolean;
}
