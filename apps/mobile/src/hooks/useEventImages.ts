import {useCallback} from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import {showToast} from '@components';
import {loggingService} from '@services/logging.service';
import {useTranslation} from './useTranslation';

interface UseEventImagesProps {
  selectedImages: {id: number; uri: string; base64?: string}[];
  setSelectedImages: (
    images: {id: number; uri: string; base64?: string}[],
  ) => void;
  setValue: (name: string, value: any, options?: any) => void;
  maxImages?: number;
}

export const useEventImages = ({
  selectedImages,
  setSelectedImages,
  setValue,
  maxImages = 3,
}: UseEventImagesProps) => {
  const {t} = useTranslation();

  const handleSelectImage = useCallback(async () => {
    try {
      if (selectedImages.length >= maxImages) {
        showToast({
          type: 'error',
          text1: t('validation.event.images.limit_reached'),
          text2: t('validation.event.images.max_images_limit'),
        });
        return;
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
        includeBase64: true,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // Check file size - 10MB limit
        if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
          showToast({
            type: 'error',
            text1: t('validation.event.images.file_too_large'),
            text2: t('validation.event.images.image_size_limit'),
          });
          return;
        }

        const newImage = {
          id: Date.now(),
          uri: asset.uri || '',
          base64: asset.base64
            ? `data:image/jpeg;base64,${asset.base64}`
            : undefined,
        };
        const updatedImages = [...selectedImages, newImage];
        setSelectedImages(updatedImages);

        const imageData = updatedImages.map(img => img.base64 || img.uri);
        setValue('images', imageData, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } catch (error) {
      loggingService.error('Error selecting event image:', error);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.event.image_selection_failed'),
      });
    }
  }, [selectedImages, setValue, maxImages, t, setSelectedImages]);

  const handleRemoveImage = useCallback(
    (id: number) => {
      const updatedImages = selectedImages.filter(image => image.id !== id);
      setSelectedImages(updatedImages);

      const imageData = updatedImages.map(img => img.base64 || img.uri);
      setValue('images', imageData, {shouldValidate: true, shouldDirty: true});
    },
    [selectedImages, setValue, setSelectedImages],
  );

  return {
    handleSelectImage,
    handleRemoveImage,
  };
};
