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
import {GroupSelectorBottomSheetContent} from '@components/GroupSelector/GroupSelector';
import {colors, commonStyles, spacing} from '@theme';
import {useTranslation} from '@hooks/useTranslation';
import {useLanguage} from '@contexts/LanguageContext';
import {useGetJoinedGroups} from '@services/group.service';
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
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showGroupModal, setShowGroupModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch groups for the selector
  const {
    groups,
    loading: groupsLoading,
    error: groupsError,
    refetch: refetchGroups,
    loadMore: loadMoreGroups,
  } = useGetJoinedGroups();

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

  const handleGroupSelect = useCallback((selectedGroupIds: string[]) => {
    setSelectedGroups(selectedGroupIds);
  }, []);

  const handleCloseGroupModal = useCallback(() => {
    setShowGroupModal(false);
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

  const handleSendEmergency = useCallback(async () => {
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

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

    setIsSubmitting(true);

    try {
      const createEmergencyInput: ICreateEmergency = {
        type: selectedType,
        addresses: location,
        descriptions: description ? [description] : [],
        selectedGroupIds:
          selectedGroups.length > 0 ? selectedGroups : undefined,
      };

      onSubmit(createEmergencyInput);
    } catch (error) {
      setIsSubmitting(false);
    }
  }, [
    selectedType,
    description,
    location,
    selectedGroups,
    onSubmit,
    t,
    isSubmitting,
  ]);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableResetScrollToCoords={false}
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

        {/* Group Selection */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>
            {t('components.emergencyBottomSheet.notify_groups')}
          </Subtitle>

          {/* Select Groups Button */}
          <Button
            title={
              selectedGroups.length > 0
                ? t('components.groupSelector.selected_count', {
                    current: selectedGroups.length,
                    max: 10,
                  })
                : t('components.groupSelector.add_group')
            }
            onPress={() => setShowGroupModal(true)}
            variant={selectedGroups.length > 0 ? 'secondary' : 'outline'}
            shape="round"
            iconName="users-filled"
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
          onPress={handleSendEmergency}
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
              {t('components.emergencyBottomSheet.emergency_location')}
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

      {/* Group Selection Modal */}
      <Modal
        visible={showGroupModal}
        animationType="slide"
        onRequestClose={handleCloseGroupModal}
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Button
              title={t('common.close')}
              onPress={handleCloseGroupModal}
              variant="text"
              size="small"
            />
            <Subtitle style={styles.modalTitle}>
              {t('components.groupSelector.title')}
            </Subtitle>
            <View style={styles.modalHeaderSpacer} />
          </View>
          <GroupSelectorBottomSheetContent
            groups={groups}
            selectedGroups={selectedGroups}
            loading={groupsLoading}
            error={groupsError}
            refetch={refetchGroups}
            loadMore={loadMoreGroups}
            onSelectionChange={handleGroupSelect}
            disabled={false}
            maxGroups={3}
          />
        </View>
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.neutral.white,
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
