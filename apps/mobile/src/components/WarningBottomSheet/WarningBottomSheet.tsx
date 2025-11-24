import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, Modal} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  AnimatedInput,
  Button,
  Subtitle,
  BodySmall,
  SelectLocationMap,
  LoadingIndicator,
} from '@components';
import {colors, commonStyles, spacing} from '@theme';
import {useTranslation} from '@hooks/useTranslation';
import {useLanguage} from '@contexts/LanguageContext';
import {
  WarningType,
  IBaseCreateAddress,
  IBaseCreateDescription,
  ICreateWarning,
  ICreateWarningAddress,
} from '@motorove/shared';

import {showToast} from '@components/ToastMessage';
import {EnumUtils} from '@utils/enumUtils';
import {WARNING_TYPE_CONFIGS} from '@utils/warningUtils';

export interface WarningBottomSheetProps {
  onSubmit: (warning: ICreateWarning) => void;
  onClose: () => void;
}

export const WarningBottomSheet: React.FC<WarningBottomSheetProps> = ({
  onSubmit,
  onClose,
}) => {
  const {t} = useTranslation();
  const {language} = useLanguage();
  const [selectedType, setSelectedType] = useState<WarningType | null>(null);
  const [description, setDescription] = useState<IBaseCreateDescription | null>(
    null,
  );
  const [location, setLocation] = useState<ICreateWarningAddress[]>([]);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleLocationSelect = useCallback(
    (selectedAddresses: IBaseCreateAddress[]) => {
      setLocation(selectedAddresses);
      // Close the modal
      setShowLocationModal(false);
    },
    [],
  );

  const handleCloseLocationModal = useCallback(() => {
    setShowLocationModal(false);
  }, []);

  // Reset submitting state when component closes
  useEffect(() => {
    return () => {
      setIsSubmitting(false);
    };
  }, []);

  const handleClose = useCallback(() => {
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  const handleSendWarning = useCallback(async () => {
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    if (!selectedType) {
      showToast({
        text1: t('common.error'),
        text2: t('components.warningBottomSheet.select_type_error'),
        type: 'error',
      });
      return;
    }

    if (!location.length) {
      showToast({
        text1: t('common.error'),
        text2: t('components.warningBottomSheet.location_required_error'),
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const createWarningInput: ICreateWarning = {
        type: selectedType,
        addresses: location,
        descriptions: description ? [description] : [],
      };

      onSubmit(createWarningInput);
    } catch (error) {
      setIsSubmitting(false);
    }
  }, [selectedType, description, location, onSubmit, t, isSubmitting]);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableResetScrollToCoords={false}
        keyboardShouldPersistTaps="handled">
        {/* Warning Type Selection */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>
            {t('components.warningBottomSheet.select_warning_type')}
          </Subtitle>
          <View style={styles.warningTypesGrid}>
            {WARNING_TYPE_CONFIGS.map(({type, icon}) => {
              const isSelected = selectedType === type;
              return (
                <View style={styles.warningTypeItem} key={type}>
                  <Button
                    onPress={() => setSelectedType(type)}
                    variant={isSelected ? 'primary' : 'outline'}
                    shape="circle"
                    iconName={icon as any}
                    iconSize={30}
                    iconColor={isSelected ? colors.neutral.black : undefined}
                    iconPosition="top"
                    style={isSelected ? styles.selectedWarningType : undefined}
                  />
                  <BodySmall align="center" style={styles.warningTypeLabel}>
                    {EnumUtils.convertWarningType(type)}
                  </BodySmall>
                </View>
              );
            })}
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>
            {t('components.warningBottomSheet.description')}
          </Subtitle>
          <AnimatedInput
            placeholder={t(
              'components.warningBottomSheet.description_placeholder',
            )}
            value={description?.description || ''}
            onChangeText={text =>
              setDescription({...description, description: text})
            }
            showClearButton={false}
            multiline={true}
          />
        </View>

        {/* Location Selection */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>
            {t('components.warningBottomSheet.warning_location')}
          </Subtitle>

          {/* Select Location Button */}
          <Button
            title={
              location.length > 0
                ? location.find(
                    address =>
                      address.language.toLowerCase() === language.toLowerCase(),
                  )?.address
                : t('components.warningBottomSheet.select_location')
            }
            onPress={() => setShowLocationModal(true)}
            variant={location.length > 0 ? 'secondary' : 'outline'}
            shape="round"
            iconName="map-pin-filled"
            style={styles.locationButton}
          />
        </View>
      </KeyboardAwareScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title={t('common.cancel')}
          onPress={handleClose}
          variant="outline"
          shape="round"
          style={{flex: 1}}
          disabled={isSubmitting}
        />

        <Button
          title={t('common.submit')}
          onPress={handleSendWarning}
          variant="dark"
          shape="round"
          style={{flex: 1}}
          disabled={!selectedType || !location.length || isSubmitting}
        />
      </View>

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        onRequestClose={handleCloseLocationModal}
        presentationStyle="pageSheet">
        <>
          <View style={styles.modalHeader}>
            <Button
              title={t('common.close')}
              onPress={handleCloseLocationModal}
              variant="text"
              size="small"
            />
            <Subtitle style={styles.modalTitle}>
              {t('components.warningBottomSheet.warning_location')}
            </Subtitle>
            <View style={styles.modalHeaderSpacer} />
          </View>
          <SelectLocationMap
            initialAddress={location[0]}
            onLocationSelect={handleLocationSelect}
            onClose={handleCloseLocationModal}
          />
        </>
      </Modal>
      <LoadingIndicator visible={isSubmitting} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomColor: colors.secondary.main,
    borderBottomWidth: 1,
  },
  warningTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  warningTypeItem: {
    width: '25%', // 4 columns with some spacing
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  selectedWarningType: {
    backgroundColor: colors.status.warning,
    borderWidth: 1,
    borderColor: colors.neutral.black,
  },
  warningTypeLabel: {
    marginTop: spacing.sm,
  },
  locationButton: {
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
  },
  modalHeaderSpacer: {
    width: 60,
  },
});
