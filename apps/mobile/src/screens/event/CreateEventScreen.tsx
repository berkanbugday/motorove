import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  TopHeaderBar,
  AnimatedInput,
  Button,
  Typography,
  Dropdown,
  DropdownItem,
  showToast,
  Icon,
  DateTimePicker,
  Switch,
  GroupSelector,
  BottomSheet,
  SelectLocationMap,
} from '@components';
import {colors, radius, spacing} from '@theme';
import {launchImageLibrary} from 'react-native-image-picker';
import {loggingService} from '@services/logging.service';
import {useGetCities} from '@services/city.service';
import {createEventSchema, CreateEventFormValues} from '@utils/validation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BottomSheetRef} from '@components/BottomSheet/BottomSheet';
import {useEnumEventTypes} from '@services/enum.service';

// Who Can Join options
const WHO_CAN_JOIN: DropdownItem[] = [
  {id: '1', value: 'Everyone', label: 'Everyone'},
  {id: '2', value: 'Group Only', label: 'Group Only'},
  {id: '3', value: 'Women Only', label: 'Women Only'},
  {id: '4', value: 'Invitation Only', label: 'Invitation Only'},
];

// Road type options
const ROAD_TYPES: DropdownItem[] = [
  {id: '1', value: 'Paved', label: 'Paved'},
  {id: '2', value: 'Off-road', label: 'Off-road'},
  {id: '3', value: 'Mixed', label: 'Mixed'},
];

// Difficulty levels
const DIFFICULTY_LEVELS: DropdownItem[] = [
  {id: '1', value: 'Easy', label: 'Easy'},
  {id: '2', value: 'Moderate', label: 'Moderate'},
  {id: '3', value: 'Hard', label: 'Hard'},
];

// Experience levels for workshops
const EXPERIENCE_LEVELS: DropdownItem[] = [
  {id: '1', value: 'Beginner', label: 'Beginner'},
  {id: '2', value: 'Intermediate', label: 'Intermediate'},
  {id: '3', value: 'Advanced', label: 'Advanced'},
  {id: '4', value: 'All Levels', label: 'All Levels'},
];

export const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'CreateEvent'>>();
  const [selectedCity, setSelectedCity] = useState<DropdownItem | null>(null);
  const [selectedEventType, setSelectedEventType] =
    useState<DropdownItem | null>(null);
  const [selectedRoadType, setSelectedRoadType] = useState<DropdownItem | null>(
    null,
  );
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DropdownItem | null>(null);
  const [selectedWhoCanJoin, setSelectedWhoCanJoin] =
    useState<DropdownItem | null>(null);
  const [selectedExperienceLevel, setSelectedExperienceLevel] =
    useState<DropdownItem | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [licenseRequired, setLicenseRequired] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  // Reference for bottom sheet
  const locationMapBottomSheetRef = useRef<BottomSheetRef>(null);
  // State for selected location
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude?: number;
    longitude?: number;
    name?: string;
    addresses?: any[];
  }>({});

  // Use city service hook
  const {cities, loading: citiesLoading} = useGetCities();

  // Use event types service hook - ignore loading state for now
  const {eventTypes} = useEnumEventTypes();

  // Setup form with Zod validation
  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
    watch,
  } = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      location: '',
      date: new Date(),
      time: new Date(),
      endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // Default 2 hours later
      city: '',
      eventType: '',
      whoCanJoin: 'Everyone',
      maxParticipants: null,
      cover: null,
      isPrivate: false,
      invitedGroups: [],
      // Ride/camping specific fields
      routeDescription: '',
      roadType: '',
      difficulty: '',
      restStops: '',
      overnightInfo: '',
      equipmentChecklist: '',
      // Workshop specific fields
      instructorInfo: '',
      topicsCovered: '',
      experienceLevel: '',
      price: '',
      // Track day/race specific fields
      trackLocation: '',
      licenseRequired: false,
      timeSlots: '',
      safetyRequirements: '',
    },
    mode: 'onChange',
  });

  // Watch the event type to conditionally render fields
  const eventType = watch('eventType');

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Open location map bottom sheet
  const handleOpenLocationMap = () => {
    locationMapBottomSheetRef.current?.open('full');
  };

  // Handle location selection from the map
  const handleLocationSelect = (location: {
    latitude?: number;
    longitude?: number;
    name?: string;
    addresses?: any[];
  }) => {
    setSelectedLocation(location);

    // Get display address (prefer English)
    const englishAddress = location.addresses?.find(
      addr => addr.language === 'en',
    );
    const turkishAddress = location.addresses?.find(
      addr => addr.language === 'tr',
    );
    const displayAddress =
      englishAddress?.address || turkishAddress?.address || '';

    // Set the location field value
    setValue('location', displayAddress, {shouldValidate: true});

    // Close the bottom sheet
    locationMapBottomSheetRef.current?.close();
  };

  const handleSelectCover = async () => {
    try {
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
            text1: 'File too large',
            text2: 'Please select an image smaller than 10MB',
          });
          return;
        }

        // Use base64 data instead of URI
        setCoverImage(asset.uri || '');
        setValue(
          'cover',
          asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null,
          {
            shouldValidate: true,
          },
        );
      }
    } catch (error) {
      loggingService.error('Error selecting cover image:', error);
    }
  };

  function handleCitySelect(item: DropdownItem | null) {
    setSelectedCity(item);
    setValue('city', item?.value || '', {shouldValidate: true});
  }

  function handleEventTypeSelect(item: DropdownItem | null) {
    setSelectedEventType(item);
    setValue('eventType', item?.value || '', {shouldValidate: true});
  }

  function handleWhoCanJoinSelect(item: DropdownItem | null) {
    setSelectedWhoCanJoin(item);
    setValue('whoCanJoin', item?.value || '', {shouldValidate: true});
  }

  function handleRoadTypeSelect(item: DropdownItem | null) {
    setSelectedRoadType(item);
    setValue('roadType', item?.value || '', {shouldValidate: true});
  }

  function handleDifficultySelect(item: DropdownItem | null) {
    setSelectedDifficulty(item);
    setValue('difficulty', item?.value || '', {shouldValidate: true});
  }

  function handleExperienceLevelSelect(item: DropdownItem | null) {
    setSelectedExperienceLevel(item);
    setValue('experienceLevel', item?.value || '', {shouldValidate: true});
  }

  const togglePrivacy = (newValue: boolean) => {
    setIsPrivate(newValue);
    setValue('isPrivate', newValue, {shouldValidate: true});

    // Reset selected groups when switching to public
    if (!newValue) {
      setSelectedGroups([]);
      setValue('invitedGroups', [], {shouldValidate: true});
    }
  };

  const toggleLicenseRequired = (newValue: boolean) => {
    setLicenseRequired(newValue);
    setValue('licenseRequired', newValue, {shouldValidate: true});
  };

  const handleGroupsChange = useCallback(
    (groupIds: string[]) => {
      setSelectedGroups(groupIds);
      setValue('invitedGroups', groupIds, {shouldValidate: true});
    },
    [setValue],
  );

  const onSubmit = async (data: CreateEventFormValues) => {
    try {
      setLoading(true);
      // TODO: Implement API call to create event
      console.log('Event data:', data);

      showToast({
        type: 'success',
        text1: 'Success',
        text2: 'Event created successfully',
      });

      // Navigate back after successful creation
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create event',
      });
      loggingService.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if event type is related to rides or camping
  const isRideOrCamping =
    eventType === 'GROUP_RIDE' ||
    eventType === 'CAMPING_RIDE' ||
    eventType === 'CHARITY_RIDE';

  // Check if event type is workshop
  const isWorkshop = eventType === 'WORKSHOP_TRAINING';

  // Check if event type is track day or race
  const isTrackDayOrRace = eventType === 'TRACK_DAY_RACE';

  // Convert cities data for dropdown
  const cityItems: DropdownItem[] = cities.map(city => ({
    id: city.id || '',
    value: city.value || '',
    label: city.value || '',
  }));

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title="Create Event"
        showBackButton
        showShadow={false}
        onBackPress={handleGoBack}
        containerStyle={styles.topHeaderBar}
      />
      <SafeAreaView style={[styles.container, {paddingBottom: insets.bottom}]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          {/* Event Cover Image Selection */}
          <TouchableOpacity
            style={styles.coverContainer}
            onPress={handleSelectCover}
            activeOpacity={0.8}>
            {coverImage ? (
              <Image source={{uri: coverImage}} style={styles.cover} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Typography variant="bodySmall" color={colors.neutral.grey}>
                  Upload event cover image
                </Typography>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.content}>
            {/* Form Fields */}
            <View style={styles.formFields}>
              {/* Event Title */}
              <AnimatedInput
                control={control as any}
                name="title"
                label="Event Title"
                error={errors.title}
              />

              {/* Event Type Dropdown */}
              <Dropdown
                data={eventTypes}
                label="Event Type"
                onSelect={item => {
                  handleEventTypeSelect(item);
                }}
                searchable={false}
                placeholder=""
                selectedItem={selectedEventType}
                error={errors.eventType?.message}
                disabled={loading}
              />

              {/* Event Description */}
              <AnimatedInput
                control={control as any}
                name="description"
                label="Description"
                multiline
                error={errors.description}
              />

              {/* Date and Time */}
              <View style={styles.dateTimeContainer}>
                <DateTimePicker
                  control={control as any}
                  name="date"
                  placeholder="Start Date"
                  displayFormat="medium"
                  mode="date"
                  minimumDate={new Date()}
                  style={styles.dateTimePicker}
                  error={errors.date}
                />
                <DateTimePicker
                  control={control as any}
                  name="time"
                  placeholder="Start Time"
                  mode="time"
                  minuteInterval={15}
                  style={styles.dateTimePicker}
                  error={errors.time}
                />
              </View>

              {/* End Time */}
              <DateTimePicker
                control={control as any}
                name="endTime"
                placeholder="Estimated End Time (optional)"
                mode="time"
                minuteInterval={15}
                style={styles.dateTimePicker}
                error={errors.endTime}
              />

              {/* Location */}
              <AnimatedInput
                control={control as any}
                name="location"
                label="Meeting Point"
                error={errors.location}
                icon={
                  <Icon name="map-pin" size={20} color={colors.neutral.grey} />
                }
                iconPosition="right"
                onPress={handleOpenLocationMap}
                editable={false}
              />

              {/* City Dropdown */}
              <Dropdown
                data={cityItems}
                label="City"
                onSelect={item => {
                  handleCitySelect(item);
                }}
                searchable={true}
                selectedItem={selectedCity}
                error={errors.city?.message}
                loading={citiesLoading}
              />

              {/* Max Participants */}
              <AnimatedInput
                control={control as any}
                name="maxParticipants"
                label="Maximum Participants (optional)"
                error={errors.maxParticipants}
                keyboardType="numeric"
              />

              {/* Who Can Join */}
              <Dropdown
                data={WHO_CAN_JOIN}
                label="Who Can Join?"
                onSelect={item => {
                  handleWhoCanJoinSelect(item);
                }}
                searchable={false}
                selectedItem={selectedWhoCanJoin}
                error={errors.whoCanJoin?.message}
              />

              {/* Privacy Switch */}
              <Switch
                value={isPrivate}
                onValueChange={togglePrivacy}
                label="Private Event"
                description="Only invited groups can join this event"
              />

              {/* Group Selector for Private Events */}
              {isPrivate && (
                <View style={styles.privateEventSection}>
                  <GroupSelector
                    selectedGroups={selectedGroups}
                    onGroupsChange={handleGroupsChange}
                    maxGroups={3}
                  />
                </View>
              )}

              {/* Conditional Fields based on Event Type */}
              {eventType && (
                <View style={styles.conditionalFieldsContainer}>
                  <Typography variant="subtitle" style={styles.sectionTitle}>
                    {eventType} Details
                  </Typography>

                  {/* Ride & Camping Specific Fields */}
                  {isRideOrCamping && (
                    <>
                      <AnimatedInput
                        control={control as any}
                        name="routeDescription"
                        label="Route Description"
                        multiline
                        error={errors.routeDescription}
                      />

                      <Dropdown
                        data={ROAD_TYPES}
                        label="Road Type"
                        onSelect={handleRoadTypeSelect}
                        searchable={false}
                        selectedItem={selectedRoadType}
                        error={errors.roadType?.message}
                      />

                      <Dropdown
                        data={DIFFICULTY_LEVELS}
                        label="Difficulty Level"
                        onSelect={handleDifficultySelect}
                        searchable={false}
                        selectedItem={selectedDifficulty}
                        error={errors.difficulty?.message}
                      />

                      <AnimatedInput
                        control={control as any}
                        name="restStops"
                        label="Fuel / Rest Stop Suggestions"
                        multiline
                        error={errors.restStops}
                      />

                      {/* Camping specific */}
                      {eventType === 'CAMPING_RIDE' && (
                        <AnimatedInput
                          control={control as any}
                          name="overnightInfo"
                          label="Overnight Information"
                          multiline
                          error={errors.overnightInfo}
                        />
                      )}

                      <AnimatedInput
                        control={control as any}
                        name="equipmentChecklist"
                        label="Equipment Checklist"
                        multiline
                        error={errors.equipmentChecklist}
                        placeholder="List required equipment, one per line"
                      />
                    </>
                  )}

                  {/* Workshop Specific Fields */}
                  {isWorkshop && (
                    <>
                      <AnimatedInput
                        control={control as any}
                        name="instructorInfo"
                        label="Instructor Information"
                        multiline
                        error={errors.instructorInfo}
                      />

                      <AnimatedInput
                        control={control as any}
                        name="topicsCovered"
                        label="Topics Covered"
                        multiline
                        error={errors.topicsCovered}
                      />

                      <Dropdown
                        data={EXPERIENCE_LEVELS}
                        label="Required Experience Level"
                        onSelect={handleExperienceLevelSelect}
                        searchable={false}
                        selectedItem={selectedExperienceLevel}
                        error={errors.experienceLevel?.message}
                      />

                      <AnimatedInput
                        control={control as any}
                        name="price"
                        label="Price (optional)"
                        keyboardType="numeric"
                        error={errors.price}
                        placeholder="Leave empty if free"
                      />
                    </>
                  )}

                  {/* Track Day / Race Specific Fields */}
                  {isTrackDayOrRace && (
                    <>
                      <AnimatedInput
                        control={control as any}
                        name="trackLocation"
                        label="Track Location"
                        error={errors.trackLocation}
                      />

                      <Switch
                        value={licenseRequired}
                        onValueChange={toggleLicenseRequired}
                        label="License Required"
                      />

                      <AnimatedInput
                        control={control as any}
                        name="timeSlots"
                        label="Time Slots / Agenda"
                        multiline
                        error={errors.timeSlots}
                      />

                      <AnimatedInput
                        control={control as any}
                        name="safetyRequirements"
                        label="Safety Gear Requirements"
                        multiline
                        error={errors.safetyRequirements}
                      />
                    </>
                  )}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={loading ? 'Saving...' : 'Save Draft'}
            variant="secondary"
            shape="round"
            onPress={() => {}}
            loading={false}
            style={{flex: 1}}
          />
          <Button
            title={loading ? 'Creating...' : 'Create Event'}
            variant="dark"
            shape="round"
            onPress={handleSubmit(onSubmit as any)}
            loading={loading}
            style={{flex: 1}}
          />
        </View>
      </SafeAreaView>

      {/* Location Map Bottom Sheet */}
      <BottomSheet
        ref={locationMapBottomSheetRef}
        title="Select Location"
        showBackdrop={true}>
        <SelectLocationMap
          onLocationSelect={handleLocationSelect}
          onClose={() => locationMapBottomSheetRef.current?.close()}
          initialLocation={
            selectedLocation.latitude && selectedLocation.longitude
              ? {
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }
              : undefined
          }
        />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  topHeaderBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.light,
  },
  coverContainer: {
    height: 150,
    overflow: 'hidden',
    backgroundColor: colors.secondary.light,
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formFields: {
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateTimePicker: {
    marginBottom: spacing.xs,
  },
  privateEventSection: {
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.secondary.light,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.light,
  },
  conditionalFieldsContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.secondary.light,
    borderRadius: radius.sm,
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
    color: colors.neutral.darkGrey,
  },
  saveButton: {
    width: '100%',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    marginTop: spacing.lg,
  },
  saveButtonText: {
    color: colors.neutral.white,
    fontWeight: '600',
  },
});

export default CreateEventScreen;
