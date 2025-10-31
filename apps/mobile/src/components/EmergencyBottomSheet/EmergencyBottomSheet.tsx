import React, {useState, useCallback} from 'react';
import {View, StyleSheet, Modal} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  AnimatedInput,
  Button,
  Subtitle,
  BodySmall,
  SelectLocationMap,
} from '@components';
import {colors, commonStyles, spacing} from '@theme';
import {useTranslation} from '@hooks/useTranslation';
import {useLanguage} from '@contexts/LanguageContext';
import {
  EmergencyType,
  IBaseCreateAddress,
  IBaseCreateDescription,
  ICreateEmergency,
  ICreateEmergencyAddress,
} from '@motorove/shared';

import {showToast} from '@components/ToastMessage';
import {EnumUtils} from '@utils/enumUtils';
import {EMERGENCY_TYPE_CONFIGS} from '@utils/emergencyUtils';

export interface EmergencyBottomSheetProps {
  onSubmit: (emergency: ICreateEmergency) => void;
  onClose: () => void;
}

export const EmergencyBottomSheet: React.FC<EmergencyBottomSheetProps> = ({
  onSubmit,
  onClose,
}) => {
  const {t} = useTranslation();
  const {language} = useLanguage();
  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null);
  const [description, setDescription] = useState<IBaseCreateDescription | null>(
    null,
  );
  const [location, setLocation] = useState<ICreateEmergencyAddress[]>([]);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

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

  const handleSendEmergency = useCallback(async () => {
    if (!selectedType) {
      showToast({
        text1: t('common.error'),
        text2: t('components.emergencyBottomSheet.select_type_error'),
        type: 'error',
      });
      return;
    }

    if (!location.length) {
      showToast({
        text1: t('common.error'),
        text2: t('components.emergencyBottomSheet.location_required_error'),
        type: 'error',
      });
      return;
    }

    const createEmergencyInput: ICreateEmergency = {
      type: selectedType,
      addresses: location,
      descriptions: description ? [description] : [],
    };

    onSubmit(createEmergencyInput);
  }, [selectedType, description, location, onSubmit, t]);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled">
        {/* Emergency Type Selection */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>
            {t('components.emergencyBottomSheet.select_emergency_type')}
          </Subtitle>
          <View style={styles.emergencyTypesGrid}>
            {EMERGENCY_TYPE_CONFIGS.map(({type, icon}) => {
              const isSelected = selectedType === type;
              return (
                <View style={styles.emergencyTypeItem} key={type}>
                  <Button
                    onPress={() => setSelectedType(type)}
                    variant={isSelected ? 'primary' : 'outline'}
                    shape="circle"
                    iconName={icon as any}
                    iconSize={30}
                    iconColor={isSelected ? colors.neutral.white : undefined}
                    iconPosition="top"
                    style={
                      isSelected ? styles.selectedEmergencyType : undefined
                    }
                  />
                  <BodySmall align="center" style={styles.emergencyTypeLabel}>
                    {EnumUtils.convertEmergencyType(type)}
                  </BodySmall>
                </View>
              );
            })}
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>
            {t('components.emergencyBottomSheet.description')}
          </Subtitle>
          <AnimatedInput
            placeholder={t(
              'components.emergencyBottomSheet.description_placeholder',
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
            {t('components.emergencyBottomSheet.emergency_location')}
          </Subtitle>

          {/* Select Location Button */}
          <Button
            title={
              location.length > 0
                ? location.find(
                    address =>
                      address.language.toLowerCase() === language.toLowerCase(),
                  )?.address
                : t('components.emergencyBottomSheet.select_location')
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
          onPress={onClose}
          variant="outline"
          shape="round"
          style={{flex: 1}}
        />

        <Button
          title={t('common.submit')}
          onPress={handleSendEmergency}
          variant="dark"
          shape="round"
          style={{flex: 1}}
          disabled={!selectedType || !location.length}
        />
      </View>

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        onRequestClose={handleCloseLocationModal}
        presentationStyle="pageSheet">
        <SelectLocationMap
          initialAddress={location[0]}
          onLocationSelect={handleLocationSelect}
          onClose={handleCloseLocationModal}
        />
      </Modal>
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
  emergencyTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emergencyTypeItem: {
    width: '25%', // 4 columns with some spacing
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  selectedEmergencyType: {
    backgroundColor: colors.status.error,
    borderWidth: 1,
    borderColor: colors.neutral.black,
  },
  emergencyTypeLabel: {
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
});
