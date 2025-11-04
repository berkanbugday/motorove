import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Control, FieldErrors, FieldError} from 'react-hook-form';
import {
  AnimatedInput,
  Dropdown,
  DropdownItem,
  Typography,
  Icon,
} from '@components';
import {colors, spacing, radius} from '@theme';
import {useTranslation} from '@hooks/useTranslation';

interface BasicInfoStepProps {
  control: Control<any>;
  errors: FieldErrors;
  eventTypes: DropdownItem[];
  selectedEventType: DropdownItem | null;
  onEventTypeSelect: (item: DropdownItem | null) => void;
  organizedByGroupOptions: DropdownItem[];
  selectedOrganizedByGroup: DropdownItem | null;
  onOrganizedByGroupSelect: (item: DropdownItem | null) => void;
  adminGroupsLoading: boolean;
  selectedImages: {id: number; uri: string; base64?: string}[];
  onSelectImage: () => void;
  onRemoveImage: (id: number) => void;
  onOpenLocationMap: () => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  control,
  errors,
  eventTypes,
  selectedEventType,
  onEventTypeSelect,
  organizedByGroupOptions,
  selectedOrganizedByGroup,
  onOrganizedByGroupSelect,
  adminGroupsLoading,
  selectedImages,
  onSelectImage,
  onRemoveImage,
  onOpenLocationMap,
}) => {
  const {t} = useTranslation();

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      keyboardShouldPersistTaps="handled"
      style={styles.scrollView}>
      <View style={styles.formFields}>
        {/* Event Title */}
        <AnimatedInput
          control={control}
          name="title"
          label={t('screens.event.event_title')}
          error={errors.title as FieldError}
          key="title-input"
        />

        {/* Event Type Dropdown */}
        <Dropdown
          data={eventTypes}
          label={t('screens.event.event_type')}
          onSelect={onEventTypeSelect}
          placeholder=""
          selectedItem={selectedEventType}
          error={errors.eventType?.message as string}
          key="eventType-dropdown"
        />

        {/* Event organized by group */}
        <Dropdown
          data={organizedByGroupOptions}
          label={t('screens.event.organized_by_group')}
          onSelect={onOrganizedByGroupSelect}
          selectedItem={selectedOrganizedByGroup}
          showClearButton={true}
          key="organizedByGroup-dropdown"
          loading={adminGroupsLoading}
        />

        {/* Meeting Point */}
        <AnimatedInput
          control={control}
          name="meetingLocation"
          label={t('screens.event.meeting_location')}
          error={errors.meetingLocation as FieldError}
          icon={
            <Icon name="map-pin-filled" size={20} color={colors.neutral.grey} />
          }
          iconPosition="right"
          onPress={onOpenLocationMap}
          editable={false}
          key="meetingLocation-input"
          testID="meetingLocation-input"
        />

        {/* Max Participants */}
        <AnimatedInput
          control={control}
          name="maxParticipants"
          label={t('screens.event.max_participants')}
          error={errors.maxParticipants as FieldError}
          keyboardType="numeric"
          key="maxParticipants-input"
          testID="maxParticipants-input"
        />

        {/* Event Description */}
        <AnimatedInput
          control={control}
          name="description"
          label={t('screens.event.description')}
          multiline
          showClearButton={false}
          error={errors.description as FieldError}
          key="description-input"
        />
      </View>

      {/* Event Images Section */}
      <View style={styles.imagesSection}>
        <Typography variant="body" style={styles.sectionTitle}>
          {t('screens.event.event_images')}
        </Typography>
        {errors.images && (
          <Typography variant="caption" color={colors.status.error}>
            {errors.images.message as string}
          </Typography>
        )}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageScrollContainer}>
          {selectedImages.map(image => (
            <View key={image.id} style={styles.imageContainer}>
              <Image source={{uri: image.uri}} style={styles.image} />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onRemoveImage(image.id)}>
                <Icon name="close" size={14} color={colors.neutral.white} />
              </TouchableOpacity>
            </View>
          ))}
          {selectedImages.length < 3 && (
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={onSelectImage}
              activeOpacity={0.8}>
              <Icon name="plus" size={24} color={colors.neutral.grey} />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
  },
  formFields: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    gap: spacing.lg,
  },
  imagesSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
    color: colors.neutral.darkGrey,
  },
  imageScrollContainer: {
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
    backgroundColor: colors.secondary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: colors.primary.light,
    borderRadius: radius.round,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
