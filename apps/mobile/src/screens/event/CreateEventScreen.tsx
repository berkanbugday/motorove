import React, {useState, useRef, useCallback, useEffect} from 'react';
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
import {useForm, FormProvider} from 'react-hook-form';
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
  UserSelector,
  Wizard,
} from '@components';
import {colors, radius, spacing} from '@theme';
import {launchImageLibrary} from 'react-native-image-picker';
import {loggingService} from '@services/logging.service';
import {eventService} from '@services/event.service';
import {createEventSchema, CreateEventFormValues} from '@utils/validation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BottomSheetRef} from '@components/BottomSheet/BottomSheet';
import {WizardHandle, WizardStep} from '@components/Wizard/Wizard';
import {
  useEnumEventTypes,
  useEnumRoadTypes,
  useEnumDifficultyLevels,
  useEnumExperienceLevels,
} from '@services/enum.service';
import {toPascalCase} from '@utils/stringUtils';

// Note: These are now fetched from backend through enum service hooks

export const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'CreateEvent'>>();
  const [selectedEventType, setSelectedEventType] =
    useState<DropdownItem | null>(null);
  const [selectedRoadType, setSelectedRoadType] = useState<DropdownItem | null>(
    null,
  );
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DropdownItem | null>(null);
  const [selectedExperienceLevel, setSelectedExperienceLevel] =
    useState<DropdownItem | null>(null);
  // Replace single coverImage with array of images
  const [selectedImages, setSelectedImages] = useState<
    {id: number; uri: string; base64?: string}[]
  >([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  // Reference for bottom sheet
  const locationMapBottomSheetRef = useRef<BottomSheetRef>(null);
  // Reference for wizard
  const wizardRef = useRef<WizardHandle>(null);
  // State for selected location
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude?: number;
    longitude?: number;
    name?: string;
    addresses?: any[];
  }>({});

  // Use enum service hooks
  const {eventTypes} = useEnumEventTypes();
  const {roadTypes} = useEnumRoadTypes();
  const {difficultyLevels} = useEnumDifficultyLevels();
  const {experienceLevels} = useEnumExperienceLevels();

  // Setup form with Zod validation
  const methods = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      location: '',
      date: new Date(),
      time: new Date(),
      endDate: new Date(),
      endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // Default 2 hours later
      maxParticipants: null,
      cover: null,
      images: [], // Add an array for multiple images
      isPrivate: false,
      invitedGroups: [],
      invitedUsers: [], // Added for inviting followers to solo rides
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
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
    watch,
    resetField,
    trigger,
  } = methods;

  // Watch the event type to conditionally render fields
  const eventType = watch('eventType');

  // Check if event type is solo ride
  const isSoloRide = eventType === 'SOLO_RIDE';

  // Effect to clear conditional fields when event type changes
  useEffect(() => {
    if (eventType) {
      // Clear all event-type specific fields
      // Ride/camping specific fields
      resetField('routeDescription');
      resetField('roadType');
      resetField('difficulty');
      resetField('restStops');
      resetField('overnightInfo');
      resetField('equipmentChecklist');

      // Workshop specific fields
      resetField('instructorInfo');
      resetField('topicsCovered');
      resetField('experienceLevel');
      resetField('price');

      // Reset UI state for dropdowns
      setSelectedRoadType(null);
      setSelectedDifficulty(null);
      setSelectedExperienceLevel(null);

      // Reset selected users and groups since they depend on event type
      setSelectedUsers([]);
      setSelectedGroups([]);
      resetField('invitedUsers');
      resetField('invitedGroups');
    }
  }, [eventType, resetField]);

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

  // Update handleSelectCover to handle multiple images
  const handleSelectCover = async () => {
    try {
      // Check if image limit is reached
      if (selectedImages.length >= 3) {
        showToast({
          type: 'error',
          text1: 'Limit Reached',
          text2: 'You can select a maximum of 3 images',
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
            text1: 'File too large',
            text2: 'Please select an image smaller than 10MB',
          });
          return;
        }

        // Add new image to array
        const newImage = {
          id: Date.now(),
          uri: asset.uri || '',
          base64: asset.base64
            ? `data:image/jpeg;base64,${asset.base64}`
            : undefined,
        };
        const updatedImages = [...selectedImages, newImage];
        setSelectedImages(updatedImages);

        // Set the first image as the cover
        if (updatedImages.length === 1) {
          setValue('cover', newImage.base64 || null, {
            shouldValidate: true,
          });
        }

        // Update the images array in the form
        const imageData = updatedImages.map(img => img.base64 || img.uri);
        setValue('images', imageData, {shouldValidate: true});
      }
    } catch (error) {
      loggingService.error('Error selecting cover image:', error);
    }
  };

  // Add function to remove an image
  const handleRemoveImage = (id: number) => {
    const updatedImages = selectedImages.filter(image => image.id !== id);
    setSelectedImages(updatedImages);

    // Update the cover image if the first image was removed
    if (updatedImages.length > 0) {
      setValue('cover', updatedImages[0].base64 || null, {
        shouldValidate: true,
      });
    } else {
      setValue('cover', null, {shouldValidate: true});
    }

    // Update the images array in the form
    const imageData = updatedImages.map(img => img.base64 || img.uri);
    setValue('images', imageData, {shouldValidate: true});
  };

  function handleEventTypeSelect(item: DropdownItem | null) {
    setSelectedEventType(item);
    setValue('eventType', item?.value || '', {shouldValidate: true});
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
  };

  const handleGroupsChange = useCallback(
    (groupIds: string[]) => {
      setSelectedGroups(groupIds);
      setValue('invitedGroups', groupIds, {shouldValidate: true});
    },
    [setValue],
  );

  const handleUsersChange = useCallback(
    (userIds: string[]) => {
      setSelectedUsers(userIds);
      setValue('invitedUsers', userIds, {shouldValidate: true});
    },
    [setValue],
  );

  const onSubmit = async (data: CreateEventFormValues) => {
    try {
      setLoading(true);

      // Use event service to create the event
      await eventService.createEvent(data);

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
        text2:
          error instanceof Error ? error.message : 'Failed to create event',
      });
      loggingService.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if event type is related to rides or camping
  const isRideOrCamping =
    eventType === 'SOLO_RIDE' ||
    eventType === 'GROUP_RIDE' ||
    eventType === 'CAMPING_RIDE' ||
    eventType === 'CHARITY_RIDE';

  // Check if event type is workshop
  const isWorkshop = eventType === 'WORKSHOP_TRAINING';

  // Wizard step validation functions
  const validateBasicInfo = async () => {
    const result = await trigger(['title', 'eventType', 'description']);
    return result;
  };

  const validateDateTime = async () => {
    const result = await trigger(['date', 'time', 'endDate', 'endTime']);
    return result;
  };

  const validateLocation = async () => {
    const result = await trigger(['location', 'maxParticipants']);
    return result;
  };

  const validateEventSpecificDetails = async () => {
    if (isRideOrCamping) {
      const fieldsToValidate: (keyof CreateEventFormValues)[] = [
        'routeDescription',
        'roadType',
        'difficulty',
        'restStops',
      ];

      if (eventType === 'CAMPING_RIDE') {
        fieldsToValidate.push('overnightInfo');
      }

      fieldsToValidate.push('equipmentChecklist');

      return await trigger(fieldsToValidate);
    } else if (isWorkshop) {
      return await trigger([
        'instructorInfo',
        'topicsCovered',
        'experienceLevel',
        'price',
      ] as const);
    }
    return true;
  };

  // Define wizard steps
  const wizardSteps: WizardStep[] = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      validate: validateBasicInfo,
      content: (
        <ScrollView showsVerticalScrollIndicator={false}>
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
          </View>

          {/* Event Cover Images Section - Updated for multiple images */}
          <View style={styles.imagesSection}>
            <Typography
              variant="body"
              weight="semiBold"
              style={styles.subSectionTitle}>
              Event Images (Max 3)
            </Typography>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageScrollContainer}>
              {selectedImages.map(image => (
                <View key={image.id} style={styles.imageContainer}>
                  <Image source={{uri: image.uri}} style={styles.image} />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveImage(image.id)}>
                    <Icon name="close" size={14} color={colors.neutral.white} />
                  </TouchableOpacity>
                </View>
              ))}
              {selectedImages.length < 3 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={handleSelectCover}
                  activeOpacity={0.8}>
                  <Icon name="plus" size={24} color={colors.neutral.grey} />
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </ScrollView>
      ),
    },
    {
      id: 'date-time',
      title: 'Date & Time',
      validate: validateDateTime,
      content: (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formFields}>
            {/* Start Date and Time */}
            <Typography
              variant="body"
              weight="medium"
              style={styles.subSectionTitle}>
              Start Date & Time
            </Typography>
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

            {/* End Date and Time */}
            <Typography
              variant="body"
              weight="medium"
              style={styles.subSectionTitle}>
              End Date & Time
            </Typography>
            <View style={styles.dateTimeContainer}>
              <DateTimePicker
                control={control as any}
                name="endDate"
                placeholder="End Date"
                displayFormat="medium"
                mode="date"
                minimumDate={new Date()}
                style={styles.dateTimePicker}
                error={errors.endDate}
              />
              <DateTimePicker
                control={control as any}
                name="endTime"
                placeholder="End Time"
                mode="time"
                minuteInterval={15}
                style={styles.dateTimePicker}
                error={errors.endTime}
              />
            </View>
          </View>
        </ScrollView>
      ),
    },
    {
      id: 'location',
      title: 'Location',
      validate: validateLocation,
      content: (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formFields}>
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

            {/* Max Participants */}
            <AnimatedInput
              control={control as any}
              name="maxParticipants"
              label="Maximum Participants (optional)"
              error={errors.maxParticipants}
              keyboardType="numeric"
            />
          </View>
        </ScrollView>
      ),
    },
    {
      id: 'event-details',
      title: 'Event Details',
      validate: validateEventSpecificDetails,
      content: (
        <ScrollView showsVerticalScrollIndicator={false}>
          {eventType ? (
            <View style={styles.formFields}>
              <Typography
                variant="subtitle"
                weight="bold"
                style={styles.sectionTitle}>
                {toPascalCase(eventType)} Details
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
                    data={roadTypes}
                    label="Road Type"
                    onSelect={handleRoadTypeSelect}
                    searchable={false}
                    selectedItem={selectedRoadType}
                    error={errors.roadType?.message}
                  />

                  <Dropdown
                    data={difficultyLevels}
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
                    data={experienceLevels}
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
            </View>
          ) : (
            <View style={styles.eventTypeWarning}>
              <Typography variant="body" color={colors.neutral.darkGrey}>
                Please select an event type in the first step
              </Typography>
            </View>
          )}
        </ScrollView>
      ),
    },
    {
      id: 'privacy',
      title: 'Privacy Settings',
      content: (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formFields}>
            {/* Privacy Switch */}
            <Switch
              value={isPrivate}
              onValueChange={togglePrivacy}
              label="Private Event"
              description="Only invited groups or users can join this event"
            />

            {/* Group/User Selectors for Private Events */}
            {isPrivate && (
              <View style={styles.privateEventSection}>
                {/* For solo rides, show user selector */}
                {isSoloRide ? (
                  <View>
                    <Typography
                      variant="bodySmall"
                      weight="semiBold"
                      style={styles.privateEventTitle}>
                      Invite Users from Followers
                    </Typography>
                    <UserSelector
                      selectedUsers={selectedUsers}
                      onUsersChange={handleUsersChange}
                      maxUsers={10}
                    />
                  </View>
                ) : (
                  /* For other event types, show group selector */
                  <View>
                    <Typography
                      variant="bodySmall"
                      weight="semiBold"
                      style={styles.privateEventTitle}>
                      Invite Groups
                    </Typography>
                    <GroupSelector
                      selectedGroups={selectedGroups}
                      onGroupsChange={handleGroupsChange}
                      maxGroups={3}
                    />
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      ),
    },
  ];

  const handleWizardComplete = (_data: any) => {
    handleSubmit(onSubmit)();
  };

  const handleNextStep = () => {
    wizardRef.current?.nextStep();
  };

  const handlePreviousStep = () => {
    wizardRef.current?.previousStep();
  };

  const handleValidationError = () => {
    showToast({
      type: 'error',
      text1: 'Validation Error',
      text2: 'Please check form fields and try again',
    });
  };

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
        <FormProvider {...methods}>
          <View style={styles.wizardContainer}>
            <Wizard
              ref={wizardRef}
              steps={wizardSteps}
              onComplete={handleWizardComplete}
              onValidationError={handleValidationError}
              progressIndicatorType="line"
            />
          </View>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {wizardRef.current?.isLastStep ? (
              <>
                <Button
                  title="Previous"
                  variant="secondary"
                  shape="round"
                  onPress={handlePreviousStep}
                  style={{flex: 1}}
                />
                <Button
                  title={loading ? 'Creating...' : 'Create Event'}
                  variant="dark"
                  shape="round"
                  onPress={handleNextStep}
                  loading={loading}
                  style={{flex: 1}}
                />
              </>
            ) : wizardRef.current?.isFirstStep ? (
              <Button
                title="Next"
                variant="dark"
                shape="round"
                onPress={handleNextStep}
                style={{flex: 1}}
              />
            ) : (
              <>
                <Button
                  title="Previous"
                  variant="secondary"
                  shape="round"
                  onPress={handlePreviousStep}
                  style={{flex: 1}}
                />
                <Button
                  title="Next"
                  variant="dark"
                  shape="round"
                  onPress={handleNextStep}
                  style={{flex: 1}}
                />
              </>
            )}
          </View>
        </FormProvider>
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
  wizardContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  topHeaderBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  coverContainer: {
    height: 150,
    overflow: 'hidden',
    backgroundColor: colors.secondary.light,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
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
  privateEventTitle: {
    marginBottom: spacing.sm,
    color: colors.neutral.darkGrey,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
  },
  conditionalFieldsContainer: {
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
    color: colors.neutral.darkGrey,
  },
  subSectionTitle: {
    marginBottom: spacing.xs,
  },
  eventTypeWarning: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // New styles for multiple image selection
  imagesSection: {
    marginTop: spacing.md,
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

export default CreateEventScreen;
