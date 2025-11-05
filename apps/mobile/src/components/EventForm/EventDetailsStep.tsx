import React from 'react';
import {View, StyleSheet} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Control, FieldErrors, FieldError} from 'react-hook-form';
import {
  AnimatedInput,
  NumberAnimatedInput,
  Dropdown,
  DropdownItem,
  Typography,
  Icon,
} from '@components';
import {colors, spacing} from '@theme';
import {useTranslation} from '@hooks/useTranslation';
import {
  CURRENCY_FORMATTING,
  Currency,
  DEFAULT_CURRENCY,
} from '@motorove/shared';

interface EventDetailsStepProps {
  control: Control<any>;
  errors: FieldErrors;
  eventType: string | undefined;
  isRideOrCamping: boolean;
  isWorkshop: boolean;
  roadTypes: DropdownItem[];
  selectedRoadType: DropdownItem | null;
  onRoadTypeSelect: (item: DropdownItem | null) => void;
  difficultyLevels: DropdownItem[];
  selectedDifficultyLevel: DropdownItem | null;
  onDifficultySelect: (item: DropdownItem | null) => void;
  experienceLevels: DropdownItem[];
  selectedExperienceLevel: DropdownItem | null;
  onExperienceLevelSelect: (item: DropdownItem | null) => void;
  currencies: DropdownItem[];
  selectedCurrency: DropdownItem | null;
  onCurrencySelect: (item: DropdownItem | null) => void;
  onOpenStartLocationMap: () => void;
  onOpenFinishLocationMap: () => void;
}

export const EventDetailsStep: React.FC<EventDetailsStepProps> = ({
  control,
  errors,
  eventType,
  isRideOrCamping,
  isWorkshop,
  roadTypes,
  selectedRoadType,
  onRoadTypeSelect,
  difficultyLevels,
  selectedDifficultyLevel,
  onDifficultySelect,
  experienceLevels,
  selectedExperienceLevel,
  onExperienceLevelSelect,
  currencies,
  selectedCurrency,
  onCurrencySelect,
  onOpenStartLocationMap,
  onOpenFinishLocationMap,
}) => {
  const {t} = useTranslation();

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      enableResetScrollToCoords={false}
      keyboardShouldPersistTaps="handled"
      style={styles.scrollView}>
      {eventType ? (
        <View style={styles.formFields}>
          {/* Ride & Camping Specific Fields */}
          {isRideOrCamping && (
            <>
              <AnimatedInput
                control={control}
                name="startLocation"
                label={t('screens.event.start_location')}
                error={errors.startLocation as FieldError}
                icon={
                  <Icon
                    name="map-pin-filled"
                    size={20}
                    color={colors.neutral.grey}
                  />
                }
                iconPosition="right"
                onPress={onOpenStartLocationMap}
                editable={false}
                key="startLocation-input"
                testID="startLocation-input"
              />

              <AnimatedInput
                control={control}
                name="finishLocation"
                label={t('screens.event.finish_location')}
                error={errors.finishLocation as FieldError}
                icon={
                  <Icon
                    name="map-pin-filled"
                    size={20}
                    color={colors.neutral.grey}
                  />
                }
                iconPosition="right"
                onPress={onOpenFinishLocationMap}
                editable={false}
                key="finishLocation-input"
                testID="finishLocation-input"
              />

              <Dropdown
                data={roadTypes}
                label={t('screens.event.road_type')}
                onSelect={onRoadTypeSelect}
                placeholder=""
                selectedItem={selectedRoadType}
                error={errors.roadType?.message as string}
                key="roadType-dropdown"
              />

              <Dropdown
                data={difficultyLevels}
                label={t('screens.event.difficulty_level')}
                onSelect={onDifficultySelect}
                placeholder=""
                selectedItem={selectedDifficultyLevel}
                error={errors.difficultyLevel?.message as string}
                key="difficultyLevel-dropdown"
              />

              {/* Camping specific */}
              {eventType === 'CAMPING_RIDE' && (
                <AnimatedInput
                  control={control}
                  name="campingInfo"
                  label={t('screens.event.camping_info')}
                  multiline
                  showClearButton={false}
                  error={errors.campingInfo as FieldError}
                  key="campingInfo-input"
                />
              )}

              <AnimatedInput
                control={control}
                name="routeDescription"
                label={t('screens.event.route_description')}
                multiline
                showClearButton={false}
                error={errors.routeDescription as FieldError}
                key="routeDescription-input"
              />

              <AnimatedInput
                control={control}
                name="restStops"
                label={t('screens.event.rest_stops')}
                multiline
                showClearButton={false}
                error={errors.restStops as FieldError}
                key="restStops-input"
              />

              <AnimatedInput
                control={control}
                name="equipmentChecklist"
                label={t('screens.event.equipment_checklist')}
                multiline
                showClearButton={false}
                error={errors.equipmentChecklist as FieldError}
                key="equipmentChecklist-input"
              />
            </>
          )}

          {/* Workshop Specific Fields */}
          {isWorkshop && (
            <>
              <AnimatedInput
                control={control}
                name="instructorInfo"
                label={t('screens.event.instructor_info')}
                multiline
                showClearButton={false}
                error={errors.instructorInfo as FieldError}
                key="instructorInfo-input"
              />

              <AnimatedInput
                control={control}
                name="topicsCovered"
                label={t('screens.event.topics_covered')}
                multiline
                showClearButton={false}
                error={errors.topicsCovered as FieldError}
                key="topicsCovered-input"
              />

              <Dropdown
                data={experienceLevels}
                label={t('screens.event.experience_level')}
                onSelect={onExperienceLevelSelect}
                placeholder=""
                selectedItem={selectedExperienceLevel}
                error={errors.experienceLevel?.message as string}
                key="experienceLevel-dropdown"
              />

              <View style={styles.priceContainer}>
                <View style={{flex: 1}}>
                  <NumberAnimatedInput
                    control={control}
                    decimalSeparator={
                      CURRENCY_FORMATTING[
                        (selectedCurrency?.value as Currency) ||
                          DEFAULT_CURRENCY
                      ].decimalSeparator
                    }
                    thousandSeparator={
                      CURRENCY_FORMATTING[
                        (selectedCurrency?.value as Currency) ||
                          DEFAULT_CURRENCY
                      ].thousandSeparator
                    }
                    name="price"
                    label={t('screens.event.price')}
                    error={errors.price as FieldError}
                    testID="price-input"
                  />
                </View>
                <View style={{flex: 1}}>
                  <Dropdown
                    data={currencies}
                    label={t('screens.event.currency')}
                    onSelect={onCurrencySelect}
                    selectedItem={selectedCurrency}
                    showClearButton={false}
                    error={errors.currency?.message as string}
                    key="currency-dropdown"
                  />
                </View>
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={styles.eventTypeWarning}>
          <Typography variant="body" color={colors.neutral.darkGrey}>
            {t('screens.event.select_event_type_prompt')}
          </Typography>
        </View>
      )}
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
  priceContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  eventTypeWarning: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
