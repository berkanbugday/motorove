import React, {useState, useCallback} from 'react';
import {View, StyleSheet, Modal} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  AnimatedInput,
  Button,
  Subtitle,
  BodySmall,
  Icon,
  SelectLocationMap,
} from '@components';
import {colors, commonStyles, radius, spacing} from '@theme';
import {useTranslation} from '@hooks/useTranslation';
import {useLanguage} from '@contexts/LanguageContext';
import {WarningType, AddressType, ICreateAddress} from '@motorove/shared';

interface ICreateWarning {
  type: WarningType;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
}
import {showToast} from '@components/ToastMessage';
import {EnumUtils} from '@utils/enumUtils';

export interface WarningBottomSheetProps {
  onSubmit: (warning: ICreateWarning) => void;
  onClose: () => void;
  initialLocation?: {latitude: number; longitude: number};
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
  initialLocation,
}) => {
  const {t} = useTranslation();
  const {language} = useLanguage();
  const [selectedType, setSelectedType] = useState<WarningType | null>(null);
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialLocation || null);
  const [location, setLocation] = useState<ICreateAddress[]>([]);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  const handleLocationSelect = useCallback(
    (selectedAddresses: ICreateAddress[]) => {
      setLocation(selectedAddresses);
      if (selectedAddresses.length > 0) {
        const address = selectedAddresses[0];
        setSelectedLocation({
          latitude: address.latitude,
          longitude: address.longitude,
        });
      }
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

    if (!selectedLocation) {
      showToast({
        text1: t('common.error'),
        text2: t('components.warningBottomSheet.location_required_error'),
        type: 'error',
      });
      return;
    }

    setIsLoading(true);

    try {
      const warning: ICreateWarning = {
        type: selectedType,
        description: description.trim() || undefined,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      };

      onSubmit(warning);
      onClose();

      showToast({
        text1: t('components.warningBottomSheet.warning_sent'),
        text2: t('components.warningBottomSheet.riders_notified'),
        type: 'success',
      });
    } catch (error) {
      console.error('Error sending warning:', error);
      showToast({
        text1: t('common.error'),
        text2: t('components.warningBottomSheet.send_error'),
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, description, selectedLocation, onSubmit, onClose, t]);

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
                    iconPosition="top"
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
            value={description}
            onChangeText={setDescription}
            showClearButton={false}
            onClearSearch={() => setDescription('')}
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

          {/* Location Info */}
          {selectedLocation && (
            <View style={styles.locationInfo}>
              <Icon name="bell" size={16} color={colors.status.info} />
              <BodySmall style={styles.locationText}>
                {t('components.warningBottomSheet.default_location_info')}
              </BodySmall>
            </View>
          )}
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
          loading={isLoading}
          disabled={!selectedType || !selectedLocation}
        />
      </View>

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        onRequestClose={handleCloseLocationModal}
        presentationStyle="pageSheet">
        <SelectLocationMap
          initialAddress={location.find(
            address =>
              address.language.toLowerCase() === language.toLowerCase(),
          )}
          addressType={AddressType.WARNING_LOCATION}
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
  warningTypeLabel: {
    marginTop: spacing.sm,
  },
  locationButton: {
    marginBottom: spacing.md,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.status.info + '10',
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  locationText: {
    flex: 1,
    color: colors.status.info,
    fontSize: 12,
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
