import React, {useState, useEffect} from 'react';
import {View, Image, TouchableOpacity, SafeAreaView} from 'react-native';
import {Icon} from '../Icon';
import {FullscreenOverlay} from '../FullscreenOverlay/FullscreenOverlay';
import {colors} from '@theme';
import {styles} from './ImagePreviewModal.styles';
import {IImage} from '@motorove/shared';

export interface ImagePreviewModalProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean;

  /**
   * Array of images to display
   */
  images: IImage[];

  /**
   * Initial index of the image to display
   */
  initialIndex?: number;

  /**
   * Callback when the modal is closed
   */
  onClose: () => void;

  /**
   * Callback when image index changes
   */
  onIndexChange?: (index: number) => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
  onIndexChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  const handleIndexChange = (index: number) => {
    setCurrentIndex(index);
    onIndexChange?.(index);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      handleIndexChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      handleIndexChange(currentIndex + 1);
    }
  };

  const currentImage = images[currentIndex];

  if (!visible || !currentImage) {
    return null;
  }

  return (
    <FullscreenOverlay
      visible={visible}
      onDismiss={onClose}
      showCloseButton={true}
      animationType="fade"
      position="center"
      backdropStyle={styles.backdrop}
      contentContainerStyle={styles.overlayContent}
      blockContentTouches={false}
      testID="image-preview-modal">
      <SafeAreaView style={styles.container}>
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{uri: currentImage.url}}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Navigation Controls */}
        {images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton]}
                onPress={handlePrevious}>
                <Icon
                  name="chevron-left"
                  size={32}
                  color={colors.neutral.white}
                />
              </TouchableOpacity>
            )}

            {currentIndex < images.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={handleNext}>
                <Icon
                  name="chevron-right"
                  size={32}
                  color={colors.neutral.white}
                />
              </TouchableOpacity>
            )}
          </>
        )}
        {images.length > 1 && (
          <View style={styles.indicators}>
            {images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicator,
                  index === currentIndex && styles.activeIndicator,
                ]}
                onPress={() => handleIndexChange(index)}
              />
            ))}
          </View>
        )}
      </SafeAreaView>
    </FullscreenOverlay>
  );
};

export default ImagePreviewModal;
