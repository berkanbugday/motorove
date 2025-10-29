import React, {useState, useCallback} from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';
import {
  AnimatedInput,
  Button,
  Subtitle,
  BodySmall,
  Icon,
} from '@components';
import {colors, commonStyles, spacing} from '@theme';
import {useTranslation} from '@hooks/useTranslation';
// Local enum and interface until shared package is updated
enum EmergencyType {
  ACCIDENT = 'ACCIDENT',
  BREAKDOWN = 'BREAKDOWN',
  MEDICAL = 'MEDICAL',
  FUEL_SHORTAGE = 'FUEL_SHORTAGE',
  TIRE_PROBLEM = 'TIRE_PROBLEM',
  BATTERY_DEAD = 'BATTERY_DEAD',
  LOST = 'LOST',
  WEATHER_HAZARD = 'WEATHER_HAZARD',
  ROAD_HAZARD = 'ROAD_HAZARD',
  OTHER = 'OTHER',
}

interface ICreateEmergency {
  type: EmergencyType;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
}
import Geolocation from '@react-native-community/geolocation';
import {showToast} from '@components/ToastMessage';

export interface EmergencyBottomSheetProps {
  onSendEmergency: (emergency: ICreateEmergency) => void;
  onClose: () => void;
}

const EMERGENCY_TYPES: Array<{
  type: EmergencyType;
  icon: string;
  color: string;
}> = [
  {type: EmergencyType.ACCIDENT, icon: 'alert-triangle', color: colors.status.error},
  {type: EmergencyType.BREAKDOWN, icon: 'wrench', color: colors.status.warning},
  {type: EmergencyType.MEDICAL, icon: 'heart', color: colors.status.error},
  {type: EmergencyType.FUEL_SHORTAGE, icon: 'fuel', color: colors.status.warning},
  {type: EmergencyType.TIRE_PROBLEM, icon: 'circle', color: colors.status.warning},
  {type: EmergencyType.BATTERY_DEAD, icon: 'battery', color: colors.status.warning},
  {type: EmergencyType.LOST, icon: 'map-pin', color: colors.status.info},
  {type: EmergencyType.WEATHER_HAZARD, icon: 'cloud-rain', color: colors.status.info},
  {type: EmergencyType.ROAD_HAZARD, icon: 'alert-triangle', color: colors.status.warning},
  {type: EmergencyType.OTHER, icon: 'help-circle', color: colors.neutral.grey},
];

export const EmergencyBottomSheet: React.FC<EmergencyBottomSheetProps> = ({
  onSendEmergency,
  onClose,
}) => {
  const {t} = useTranslation();
  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleTypeSelect = useCallback((type: EmergencyType) => {
    setSelectedType(type);
    // Auto-fill title based on emergency type
    setTitle(t(`enums.emergencyType.${type.toLowerCase()}`));
  }, [t]);

  const getCurrentLocation = useCallback((): Promise<{latitude: number; longitude: number}> => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          console.error('Error getting location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
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

    if (!title.trim()) {
      showToast({
        text1: t('common.error'),
        text2: t('components.emergencyBottomSheet.title_required_error'),
        type: 'error',
      });
      return;
    }

    setIsLoading(true);

    try {
      const location = await getCurrentLocation();

      const emergency: ICreateEmergency = {
        type: selectedType,
        title: title.trim(),
        description: description.trim() || undefined,
        latitude: location.latitude,
        longitude: location.longitude,
      };

      onSendEmergency(emergency);
      onClose();
      
      showToast({
        text1: t('components.emergencyBottomSheet.emergency_sent'),
        text2: t('components.emergencyBottomSheet.help_on_way'),
        type: 'success',
      });
    } catch (error) {
      console.error('Error sending emergency:', error);
      showToast({
        text1: t('common.error'),
        text2: t('components.emergencyBottomSheet.location_error'),
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, title, description, getCurrentLocation, onSendEmergency, onClose, t]);

  const handleCancel = useCallback(() => {
    Alert.alert(
      t('components.emergencyBottomSheet.cancel_title'),
      t('components.emergencyBottomSheet.cancel_message'),
      [
        {
          text: t('common.no'),
          style: 'cancel',
        },
        {
          text: t('common.yes'),
          style: 'destructive',
          onPress: onClose,
        },
      ]
    );
  }, [onClose, t]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>

        {/* Emergency Type Selection */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>
            {t('components.emergencyBottomSheet.select_emergency_type')}
          </Subtitle>
          <View style={styles.emergencyTypesGrid}>
            {EMERGENCY_TYPES.map(({type, icon, color}) => {
              const isSelected = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.emergencyTypeCard,
                    isSelected && styles.emergencyTypeCardSelected,
                  ]}
                  onPress={() => handleTypeSelect(type)}
                  activeOpacity={0.7}>
                  <Icon
                    name={icon}
                    size={24}
                    color={isSelected ? colors.neutral.white : color}
                  />
                  <BodySmall
                    style={[
                      styles.emergencyTypeText,
                      isSelected && styles.emergencyTypeTextSelected,
                    ]}>
                    {t(`enums.emergencyType.${type.toLowerCase()}`)}
                  </BodySmall>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>
            {t('components.emergencyBottomSheet.emergency_title')}
          </Subtitle>
          <AnimatedInput
            label={t('components.emergencyBottomSheet.title_placeholder')}
            value={title}
            onChangeText={setTitle}
            showClearButton={true}
            onClearSearch={() => setTitle('')}
            maxLength={100}
          />
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>
            {t('components.emergencyBottomSheet.additional_details')}
          </Subtitle>
          <AnimatedInput
            label={t('components.emergencyBottomSheet.description_placeholder')}
            value={description}
            onChangeText={setDescription}
            showClearButton={true}
            onClearSearch={() => setDescription('')}
            multiline={true}
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        {/* Location Info */}
        <View style={styles.locationInfo}>
          <Icon name="map-pin" size={16} color={colors.status.info} />
          <BodySmall style={styles.locationText}>
            {t('components.emergencyBottomSheet.location_info')}
          </BodySmall>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title={t('common.cancel')}
          onPress={handleCancel}
          variant="outline"
          shape="round"
          style={{flex: 1}}
        />

        <Button
          title={t('components.emergencyBottomSheet.send_emergency')}
          onPress={handleSendEmergency}
          variant="primary"
          shape="round"
          style={{flex: 1}}
          loading={isLoading}
          disabled={!selectedType || !title.trim()}
        />
      </View>
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
    gap: spacing.sm,
  },
  emergencyTypeCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    gap: spacing.xs,
  },
  emergencyTypeCardSelected: {
    backgroundColor: colors.status.error,
    borderColor: colors.status.error,
  },
  emergencyTypeText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  emergencyTypeTextSelected: {
    color: colors.neutral.white,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.status.info + '10',
    borderRadius: 8,
    marginBottom: spacing.lg,
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
