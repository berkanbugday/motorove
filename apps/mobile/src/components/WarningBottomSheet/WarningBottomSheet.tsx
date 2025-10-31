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
  WarningType,
  IBaseCreateAddress,
  IBaseCreateDescription,
  ICreateWarning,
  ICreateWarningAddress,
} from '@motorove/shared';

import {showToast} from '@components/ToastMessage';
import {EnumUtils} from '@utils/enumUtils';

export interface WarningBottomSheetProps {
  onSubmit: (warning: ICreateWarning) => void;
  onClose: () => void;
}

const WARNING_TYPES: Array<{
  type: WarningType;
  icon: string;
}> = [
  {type: WarningType.RADAR, icon: 'radar-filled'},
  {type: WarningType.POLICE_CHECKPOINT, icon: 'siren-on-filled'},
  {type: WarningType.ACCIDENT, icon: 'car-crash-filled'},
  {type: WarningType.ROAD_CONSTRUCTION, icon: 'person-digging-filled'},
  {type: WarningType.ROAD_CLOSURE, icon: 'do-not-enter-filled'},
  {type: WarningType.DANGEROUS_CURVE, icon: 'scribble-filled'},
  {type: WarningType.SLIPPERY_ROAD, icon: 'road-filled'},
  {type: WarningType.PARKING_PROHIBITED, icon: 'ban-parking-filled'},
  {type: WarningType.OTHER, icon: 'error-filled'},
];

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

  const handleSendWarning = useCallback(async () => {
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

    const createWarningInput: ICreateWarning = {
      type: selectedType,
      addresses: location,
      descriptions: description ? [description] : [],
    };

    onSubmit(createWarningInput);
  }, [selectedType, description, location, onSubmit, t]);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled">
        {/* Warning Type Selection */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>
            {t('components.warningBottomSheet.select_warning_type')}
          </Subtitle>
          <View style={styles.warningTypesGrid}>
            {WARNING_TYPES.map(({type, icon}) => {
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
          onPress={onClose}
          variant="outline"
          shape="round"
          style={{flex: 1}}
        />

        <Button
          title={t('common.submit')}
          onPress={handleSendWarning}
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
});
