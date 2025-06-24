import React, {useState, useRef, useCallback, useEffect, useMemo} from 'react';
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
import Dialog from '@components/Dialog';
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

export const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'CreateEvent'>>();
  const insets = useSafeAreaInsets();

  // Refs
  const locationMapBottomSheetRef = useRef<BottomSheetRef>(null);
  const wizardRef = useRef<WizardHandle>(null);
  const exitDialogRef = useRef<any>(null);
  const draftDialogRef = useRef<any>(null);

  // State hooks
  const [selectedEventType, setSelectedEventType] =
    useState<DropdownItem | null>(null);
  const [selectedRoadType, setSelectedRoadType] = useState<DropdownItem | null>(
    null,
  );
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DropdownItem | null>(null);
  const [selectedExperienceLevel, setSelectedExperienceLevel] =
    useState<DropdownItem | null>(null);
  const [selectedImages, setSelectedImages] = useState<
    {id: number; uri: string; base64?: string}[]
  >([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [isLastStep, setIsLastStep] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude?: number;
    longitude?: number;
    name?: string;
    addresses?: any[];
  }>({});

  // Enum hooks
  const {eventTypes} = useEnumEventTypes();
  const {roadTypes} = useEnumRoadTypes();
  const {difficultyLevels} = useEnumDifficultyLevels();
  const {experienceLevels} = useEnumExperienceLevels();

  // Form setup with Zod validation
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
      images: [],
      isPrivate: false,
      invitedGroups: [],
      invitedUsers: [],
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
    formState: {errors, isDirty},
    setValue,
    watch,
    resetField,
    trigger,
    getValues,
  } = methods;

  // Watch key form values
  const eventType = watch('eventType');

  // Memoized derived values
  const isSoloRide = useMemo(() => eventType === 'SOLO_RIDE', [eventType]);
  const isRideOrCamping = useMemo(
    () =>
      ['SOLO_RIDE', 'GROUP_RIDE', 'CAMPING_RIDE', 'CHARITY_RIDE'].includes(
        eventType || '',
      ),
    [eventType],
  );
  const isWorkshop = useMemo(
    () => eventType === 'WORKSHOP_TRAINING',
    [eventType],
  );
  const shouldShowEventDetails = useMemo(
    () => isRideOrCamping || isWorkshop,
    [isRideOrCamping, isWorkshop],
  );

  // Navigation handlers
  const handleGoBack = useCallback(() => {
    if (isDirty) {
      exitDialogRef.current?.open();
    } else {
      navigation.goBack();
    }
  }, [navigation, isDirty]);

  const confirmExit = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSaveDraft = useCallback(() => {
    draftDialogRef.current?.open();
  }, []);

  const confirmSaveDraft = useCallback(() => {
    const formData = getValues();

    try {
      // Save draft logic would go here
      console.log('Saving draft:', formData);
      showToast({
        type: 'success',
        text1: 'Success',
        text2: 'Event draft saved successfully',
      });
    } catch (error) {
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save draft',
      });
      loggingService.error('Error saving draft:', error);
    }
  }, [getValues]);

  const handleNextStep = useCallback(async () => {
    wizardRef.current?.nextStep();
  }, []);

  const handlePreviousStep = useCallback(() => {
    wizardRef.current?.previousStep();
  }, []);

  // Location selection handlers
  const handleOpenLocationMap = useCallback(() => {
    locationMapBottomSheetRef.current?.open('full');
  }, []);

  const handleLocationSelect = useCallback(
    (location: {
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
    },
    [setValue],
  );

  // Image selection handlers
  const handleSelectImages = useCallback(async () => {
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

        // Update the images array in the form
        const imageData = updatedImages.map(img => img.base64 || img.uri);
        setValue('images', imageData, {shouldValidate: true});
      }
    } catch (error) {
      loggingService.error('Error selecting cover image:', error);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to select image',
      });
    }
  }, [selectedImages, setValue]);

  const handleRemoveImage = useCallback(
    (id: number) => {
      const updatedImages = selectedImages.filter(image => image.id !== id);
      setSelectedImages(updatedImages);

      // Update the images array in the form
      const imageData = updatedImages.map(img => img.base64 || img.uri);
      setValue('images', imageData, {shouldValidate: true});
    },
    [selectedImages, setValue],
  );

  // Dropdown selection handlers
  const handleEventTypeSelect = useCallback(
    (item: DropdownItem | null) => {
      setSelectedEventType(item);
      setValue('eventType', item?.value || '', {shouldValidate: true});
    },
    [setValue],
  );

  const handleRoadTypeSelect = useCallback(
    (item: DropdownItem | null) => {
      setSelectedRoadType(item);
      setValue('roadType', item?.value || '', {shouldValidate: true});
    },
    [setValue],
  );

  const handleDifficultySelect = useCallback(
    (item: DropdownItem | null) => {
      setSelectedDifficulty(item);
      setValue('difficulty', item?.value || '', {shouldValidate: true});
    },
    [setValue],
  );

  const handleExperienceLevelSelect = useCallback(
    (item: DropdownItem | null) => {
      setSelectedExperienceLevel(item);
      setValue('experienceLevel', item?.value || '', {shouldValidate: true});
    },
    [setValue],
  );

  // Toggle handlers
  const togglePrivacy = useCallback(
    (newValue: boolean) => {
      setIsPrivate(newValue);
      setValue('isPrivate', newValue, {shouldValidate: true});
    },
    [setValue],
  );

  // Group and user selection handlers
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

  // Step change handler
  const handleStepChange = useCallback((index: number) => {
    setCurrentStepIndex(index);
  }, []);

  // Form validation functions
  const validateBasicInfo = useCallback(async () => {
    return await trigger([
      'title',
      'eventType',
      'maxParticipants',
      'description',
    ]);
  }, [trigger]);

  const validateDateTime = useCallback(async () => {
    const fieldsToValidate = [
      'date',
      'time',
      'endDate',
      'endTime',
      'location',
      'isPrivate',
    ];

    // Add conditional fields based on privacy settings
    if (isPrivate) {
      if (isSoloRide) {
        fieldsToValidate.push('invitedUsers');
      } else {
        fieldsToValidate.push('invitedGroups');
      }
    }

    return await trigger(fieldsToValidate as (keyof CreateEventFormValues)[]);
  }, [trigger, isPrivate, isSoloRide]);

  const validateEventSpecificDetails = useCallback(async () => {
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
  }, [isRideOrCamping, isWorkshop, eventType, trigger]);

  // Form submission handler
  const onSubmit = useCallback(
    async (data: CreateEventFormValues) => {
      try {
        setLoading(true);

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
    },
    [navigation],
  );

  const handleWizardComplete = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  // Define wizard steps
  const baseWizardSteps = useMemo<WizardStep[]>(
    () => [
      {
        id: 'basic-info',
        title: 'Basic Information',
        validate: validateBasicInfo,
        content: (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}>
            <View style={styles.formFields}>
              {/* Event Title */}
              <AnimatedInput
                control={control}
                name="title"
                label="Event Title"
                error={errors.title}
                key="title-input"
              />

              {/* Event Type Dropdown */}
              <Dropdown
                data={eventTypes}
                label="Event Type"
                onSelect={handleEventTypeSelect}
                searchable={false}
                placeholder=""
                selectedItem={selectedEventType}
                error={errors.eventType?.message}
                disabled={loading}
                key="eventType-dropdown"
              />

              {/* Max Participants */}
              <AnimatedInput
                control={control}
                name="maxParticipants"
                label="Maximum Participants (optional)"
                error={errors.maxParticipants}
                keyboardType="numeric"
                key="maxParticipants-input"
                testID="maxParticipants-input"
              />

              {/* Event Description */}
              <AnimatedInput
                control={control}
                name="description"
                label="Description (optional)"
                multiline
                error={errors.description}
                key="description-input"
              />
            </View>

            {/* Event Cover Images Section */}
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
                      <Icon
                        name="close"
                        size={14}
                        color={colors.neutral.white}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
                {selectedImages.length < 3 && (
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={handleSelectImages}
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
        title: 'Date, Time & Location',
        validate: validateDateTime,
        content: (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}>
            <View style={styles.formFields}>
              <View style={styles.dateTimeContainer}>
                <DateTimePicker
                  control={control}
                  name="date"
                  placeholder="Start Date"
                  displayFormat="medium"
                  mode="date"
                  minimumDate={new Date()}
                  style={styles.dateTimePicker}
                  error={errors.date}
                  key="date-picker"
                />
                <DateTimePicker
                  control={control}
                  name="time"
                  placeholder="Start Time"
                  mode="time"
                  minuteInterval={15}
                  style={styles.dateTimePicker}
                  error={errors.time}
                  key="time-picker"
                />
              </View>

              {/* End Date and Time */}
              <View style={styles.dateTimeContainer}>
                <DateTimePicker
                  control={control}
                  name="endDate"
                  placeholder="End Date"
                  displayFormat="medium"
                  mode="date"
                  minimumDate={new Date()}
                  style={styles.dateTimePicker}
                  error={errors.endDate}
                  key="endDate-picker"
                />
                <DateTimePicker
                  control={control}
                  name="endTime"
                  placeholder="End Time"
                  mode="time"
                  minuteInterval={15}
                  style={styles.dateTimePicker}
                  error={errors.endTime}
                  key="endTime-picker"
                />
              </View>

              {/* Location */}
              <AnimatedInput
                control={control}
                name="location"
                label="Meeting Point"
                error={errors.location}
                icon={
                  <Icon name="map-pin" size={20} color={colors.neutral.grey} />
                }
                iconPosition="right"
                onPress={handleOpenLocationMap}
                editable={false}
                key="location-input"
                testID="location-input"
              />

              {/* Privacy Settings */}
              <View style={styles.privacySection}>
                <Typography
                  variant="body"
                  weight="semiBold"
                  style={styles.subSectionTitle}>
                  Privacy Settings
                </Typography>

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
            </View>
          </ScrollView>
        ),
      },

      {
        id: 'event-details',
        title: 'Event Details',
        validate: validateEventSpecificDetails,
        content: (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}>
            {eventType ? (
              <View style={styles.formFields}>
                {/* Ride & Camping Specific Fields */}
                {isRideOrCamping && (
                  <>
                    <AnimatedInput
                      control={control}
                      name="routeDescription"
                      label="Route Description"
                      multiline
                      error={errors.routeDescription}
                      key="routeDescription-input"
                    />

                    <Dropdown
                      data={roadTypes}
                      label="Road Type"
                      onSelect={handleRoadTypeSelect}
                      searchable={false}
                      placeholder=""
                      selectedItem={selectedRoadType}
                      error={errors.roadType?.message}
                      key="roadType-dropdown"
                    />

                    <Dropdown
                      data={difficultyLevels}
                      label="Difficulty Level"
                      placeholder=""
                      onSelect={handleDifficultySelect}
                      searchable={false}
                      selectedItem={selectedDifficulty}
                      error={errors.difficulty?.message}
                      key="difficulty-dropdown"
                    />

                    <AnimatedInput
                      control={control}
                      name="restStops"
                      label="Fuel / Rest Stop Suggestions"
                      multiline
                      error={errors.restStops}
                      key="restStops-input"
                    />

                    {/* Camping specific */}
                    {eventType === 'CAMPING_RIDE' && (
                      <AnimatedInput
                        control={control}
                        name="overnightInfo"
                        label="Overnight Information"
                        multiline
                        error={errors.overnightInfo}
                        key="overnightInfo-input"
                      />
                    )}

                    <AnimatedInput
                      control={control}
                      name="equipmentChecklist"
                      label="Equipment Checklist"
                      multiline
                      error={errors.equipmentChecklist}
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
                      label="Instructor Information"
                      multiline
                      error={errors.instructorInfo}
                      key="instructorInfo-input"
                    />

                    <AnimatedInput
                      control={control}
                      name="topicsCovered"
                      label="Topics Covered"
                      multiline
                      error={errors.topicsCovered}
                      key="topicsCovered-input"
                    />

                    <Dropdown
                      data={experienceLevels}
                      label="Required Experience Level"
                      onSelect={handleExperienceLevelSelect}
                      searchable={false}
                      selectedItem={selectedExperienceLevel}
                      error={errors.experienceLevel?.message}
                      key="experienceLevel-dropdown"
                    />

                    <AnimatedInput
                      control={control}
                      name="price"
                      label="Price (optional)"
                      keyboardType="numeric"
                      error={errors.price}
                      placeholder="Leave empty if free"
                      key="price-input"
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
    ],
    [
      validateBasicInfo,
      validateDateTime,
      validateEventSpecificDetails,
      control,
      errors,
      eventTypes,
      selectedEventType,
      loading,
      selectedImages,
      handleRemoveImage,
      handleSelectImages,
      handleEventTypeSelect,
      roadTypes,
      difficultyLevels,
      experienceLevels,
      selectedRoadType,
      selectedDifficulty,
      selectedExperienceLevel,
      handleRoadTypeSelect,
      handleDifficultySelect,
      handleExperienceLevelSelect,
      isPrivate,
      togglePrivacy,
      isSoloRide,
      selectedUsers,
      selectedGroups,
      handleUsersChange,
      handleGroupsChange,
      eventType,
      isRideOrCamping,
      isWorkshop,
      handleOpenLocationMap,
    ],
  );

  // Filter steps based on event type
  const wizardSteps = useMemo(
    () =>
      shouldShowEventDetails
        ? baseWizardSteps
        : baseWizardSteps.filter(step => step.id !== 'event-details'),
    [shouldShowEventDetails, baseWizardSteps],
  );

  // Reset fields when event type changes
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

      // If we're past the first step, jump back to first step
      if (currentStepIndex > 0) {
        setTimeout(() => {
          wizardRef.current?.jumpToStep(0);
        }, 0);
      }
    }
  }, [eventType, resetField]);

  // Update step status when wizard step changes
  useEffect(() => {
    setIsFirstStep(currentStepIndex === 0);
    setIsLastStep(currentStepIndex === wizardSteps.length - 1);
  }, [currentStepIndex, wizardSteps.length]);

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title="Create Event"
        showBackButton
        showShadow={false}
        onBackPress={handleGoBack}
        rightIconName={isDirty ? 'check' : undefined}
        onRightButtonPress={isDirty ? handleSaveDraft : undefined}
      />
      <SafeAreaView style={[styles.container, {paddingBottom: insets.bottom}]}>
        <FormProvider {...methods}>
          <View style={styles.wizardContainer}>
            <Wizard
              ref={wizardRef}
              steps={wizardSteps}
              onComplete={handleWizardComplete}
              progressIndicatorType="line"
              onStepChange={handleStepChange}
            />
          </View>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {isLastStep ? (
              <>
                <Button
                  title="Previous"
                  variant="outline"
                  shape="round"
                  onPress={handlePreviousStep}
                  style={{flex: 1}}
                />
                <Button
                  title={loading ? 'Creating...' : 'Create Event'}
                  variant="dark"
                  shape="round"
                  onPress={handleSubmit(onSubmit)}
                  loading={loading}
                  style={{flex: 1}}
                />
              </>
            ) : isFirstStep ? (
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
                  variant="outline"
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

      {/* Exit Confirmation Dialog */}
      <Dialog
        ref={exitDialogRef}
        title="Exit Without Saving"
        message="Are you sure you want to exit? All unsaved changes will be lost."
        variant="confirm"
        confirmButton={{
          text: 'Exit',
          variant: 'primary',
          onPress: confirmExit,
        }}
        cancelButton={{
          text: 'Cancel',
          variant: 'outline',
        }}
      />

      {/* Save Draft Confirmation Dialog */}
      <Dialog
        ref={draftDialogRef}
        title="Save Draft"
        message="Do you want to save your event as a draft? You can continue editing it later."
        variant="confirm"
        confirmButton={{
          text: 'Save Draft',
          variant: 'primary',
          onPress: confirmSaveDraft,
        }}
        cancelButton={{
          text: 'Cancel',
          variant: 'outline',
        }}
      />
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
  privacySection: {
    marginTop: spacing.md,
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
  scrollView: {
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
  },
  formFields: {
    marginTop: spacing.lg,
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
    paddingHorizontal: spacing.md,
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
  // Styles for multiple image selection
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
