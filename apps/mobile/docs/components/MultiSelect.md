# MultiSelect Component

A flexible and reusable dropdown component for selecting multiple items. This component is designed to work seamlessly with TypeScript enums and follows the project's design system.

## Features

- Select multiple items from a dropdown list
- Search functionality for finding items quickly
- Customizable rendering for items and selected tags
- Keyboard-friendly with support for focus and blur events
- Animated label for improved UX
- Full TypeScript support
- Integration with shared enum types

## Basic Usage

```tsx
import React, {useState} from 'react';
import MultiSelect from '@components/MultiSelect';
import {
  enumToSelectItems,
  getSelectedEnumValues,
} from '@utils/enumToSelectItems';
import {EquipmentType} from '@motorove/shared/enums';

const MyScreen = () => {
  // Convert enum to items for MultiSelect
  const equipmentItems = enumToSelectItems(EquipmentType);

  // Track selected items
  const [selectedEquipment, setSelectedEquipment] = useState([]);

  return (
    <MultiSelect
      label="Equipment"
      data={equipmentItems}
      selectedItems={selectedEquipment}
      onSelectionChange={setSelectedEquipment}
      placeholder="Select equipment"
    />
  );
};
```

## Getting Selected Enum Values

```tsx
// Inside your component...
const handleSubmit = () => {
  // Convert selected items back to enum values
  const equipmentEnumValues = getSelectedEnumValues(selectedEquipment);

  // Now you can use these enum values in your API calls
  submitToApi({
    equipment: equipmentEnumValues,
  });
};
```

## Props

| Prop                 | Type                                                         | Description                                                |
| -------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| `data`               | `MultiSelectItem[]`                                          | Array of items to display in the dropdown                  |
| `selectedItems`      | `MultiSelectItem[]`                                          | Currently selected items                                   |
| `onSelectionChange`  | `(items: MultiSelectItem[]) => void`                         | Callback when selection changes                            |
| `label`              | `string`                                                     | Optional label for the dropdown                            |
| `placeholder`        | `string`                                                     | Placeholder text when no items selected                    |
| `searchable`         | `boolean`                                                    | Whether the dropdown is searchable (default: true)         |
| `disabled`           | `boolean`                                                    | Whether the component is disabled                          |
| `error`              | `string`                                                     | Error message to display                                   |
| `helperText`         | `string`                                                     | Helper text to display below the input                     |
| `maxHeight`          | `number`                                                     | Maximum height for the dropdown list                       |
| `renderItem`         | `(item: MultiSelectItem, isSelected: boolean) => ReactNode`  | Custom item renderer                                       |
| `renderSelectedItem` | `(item: MultiSelectItem, onRemove: () => void) => ReactNode` | Custom selected item chip renderer                         |
| `renderNoResults`    | `() => ReactNode`                                            | Custom no results message                                  |
| `closeOnSelect`      | `boolean`                                                    | Whether to close dropdown after selection (default: false) |

## Styling Props

| Prop             | Type        | Description                           |
| ---------------- | ----------- | ------------------------------------- |
| `containerStyle` | `ViewStyle` | Custom styles for the container       |
| `inputStyle`     | `ViewStyle` | Custom styles for the input container |
| `dropdownStyle`  | `ViewStyle` | Custom styles for the dropdown        |
| `itemStyle`      | `ViewStyle` | Custom styles for list items          |
| `chipStyle`      | `ViewStyle` | Custom styles for selected item chips |
| `chipTextStyle`  | `TextStyle` | Custom styles for chip text           |

## Advanced Usage

### Custom Item Rendering

```tsx
<MultiSelect
  // ...other props
  renderItem={(item, isSelected) => (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Icon name={isSelected ? 'check-filled' : 'check'} size={16} />
      <Text style={{marginLeft: 8}}>{item.label}</Text>
    </View>
  )}
/>
```

### Custom Selected Item Rendering

```tsx
<MultiSelect
  // ...other props
  renderSelectedItem={(item, onRemove) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.primary.light,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
      }}
      onPress={onRemove}>
      <Text style={{color: colors.neutral.white, marginRight: 4}}>
        {item.label}
      </Text>
      <Icon name="close" size={14} color={colors.neutral.white} />
    </TouchableOpacity>
  )}
/>
```
