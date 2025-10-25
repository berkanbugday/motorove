# BusinessDetailModal

A fullscreen modal component with smooth scale animations for displaying detailed business information in a mobile app.

## Features

- ✨ **Smooth Scale Animation**: Uses React Native Reanimated for buttery smooth scale and slide animations
- 📱 **Fullscreen Modal**: Takes full advantage of screen real estate for detailed information
- 🎨 **Beautiful UI**: Modern design with consistent styling following the app's design system
- 🔄 **Auto-close**: Supports backdrop press to close and hardware back button handling
- 📍 **Distance Calculation**: Automatically calculates and displays distance from user location
- 📞 **Quick Actions**: Direct call and directions buttons for immediate action
- 🌐 **Multi-language Support**: Handles business descriptions in multiple languages
- ♿ **Accessibility**: Proper accessibility support and keyboard handling

## Props

| Prop                   | Type                                    | Default                   | Description                             |
| ---------------------- | --------------------------------------- | ------------------------- | --------------------------------------- |
| `visible`              | `boolean`                               | `false`                   | Whether the modal is visible            |
| `business`             | `IBusiness \| null`                     | `null`                    | Business data to display                |
| `onClose`              | `() => void`                            | -                         | Function called when modal should close |
| `userLocation`         | `{latitude: number, longitude: number}` | -                         | User location for distance calculation  |
| `animationDuration`    | `number`                                | `400`                     | Animation duration in milliseconds      |
| `containerStyle`       | `StyleProp<ViewStyle>`                  | -                         | Custom container styles                 |
| `closeOnBackdropPress` | `boolean`                               | `true`                    | Whether to close on backdrop press      |
| `testID`               | `string`                                | `'business-detail-modal'` | Test identifier                         |

## Usage

### Basic Usage

```tsx
import React, {useState} from 'react';
import {BusinessDetailModal} from '@components';
import {IBusiness} from '@motorove/shared';

const MyScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<IBusiness | null>(
    null,
  );

  const handleBusinessPress = (business: IBusiness) => {
    setSelectedBusiness(business);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedBusiness(null);
  };

  return (
    <>
      {/* Your screen content */}

      <BusinessDetailModal
        visible={modalVisible}
        business={selectedBusiness}
        onClose={handleCloseModal}
        userLocation={{latitude: 40.7128, longitude: -74.006}}
      />
    </>
  );
};
```

### With RNMapMarkerCard Integration

The `RNMapMarkerCard` component has been enhanced to automatically show the `BusinessDetailModal` when pressed:

```tsx
import React from 'react';
import {RNMapMarkerCard} from '@components/RNMap';
import {IBusiness} from '@motorove/shared';

const MapScreen = () => {
  const business: IBusiness = {
    // ... business data
  };

  return (
    <RNMapMarkerCard
      business={business}
      userLocation={{latitude: 40.7128, longitude: -74.006}}
      showDetailModal={true} // Enable modal (default: true)
      onDetailModalOpen={business =>
        console.log('Modal opened for:', business.name)
      }
      onDetailModalClose={() => console.log('Modal closed')}
    />
  );
};
```

### Using Ref for Programmatic Control

```tsx
import React, {useRef} from 'react';
import {BusinessDetailModal, BusinessDetailModalRef} from '@components';

const MyScreen = () => {
  const modalRef = useRef<BusinessDetailModalRef>(null);

  const showBusinessDetail = (business: IBusiness) => {
    modalRef.current?.open(business);
  };

  const hideBusinessDetail = () => {
    modalRef.current?.close();
  };

  return (
    <BusinessDetailModal
      ref={modalRef}
      visible={false}
      business={null}
      onClose={() => console.log('Modal closed')}
    />
  );
};
```

## Animation Details

The modal uses a combination of animations for a smooth user experience:

- **Scale Animation**: The modal content scales from 0.8 to 1.0 with a spring animation
- **Slide Animation**: Slides in from the bottom of the screen
- **Backdrop Animation**: Smooth fade-in/out for the backdrop overlay
- **Spring Physics**: Uses natural spring physics with carefully tuned damping and stiffness values

## Customization

### Custom Styling

```tsx
<BusinessDetailModal
  visible={true}
  business={business}
  onClose={handleClose}
  containerStyle={{
    maxWidth: 500,
    borderRadius: 20,
  }}
/>
```

### Custom Animation Duration

```tsx
<BusinessDetailModal
  visible={true}
  business={business}
  onClose={handleClose}
  animationDuration={600} // Slower animation
/>
```

## Requirements

- React Native 0.60+
- React Native Reanimated 3.0+
- @motorove/shared package for IBusiness types
- Proper theme configuration for colors and styling

## Notes

- The modal automatically handles Android hardware back button
- Distance calculation uses the Haversine formula for accuracy
- The modal is optimized for performance with proper memoization
- All animations run on the UI thread for smooth 60fps performance
