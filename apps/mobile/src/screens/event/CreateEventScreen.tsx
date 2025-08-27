import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useLayoutEffect,
} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  BackHandler,
  Platform,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
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
  Tabs,
} from '@components';
import Dialog from '@components/Dialog';
import {colors, commonStyles, radius, spacing} from '@theme';
import {launchImageLibrary} from 'react-native-image-picker';
import {loggingService} from '@services/logging.service';
import {eventService} from '@services/event.service';
import {eventSchemas, CreateEventFormValues} from '@utils/validation';
import {useTranslation} from '@hooks/useTranslation';
import {ICreateAddress, AddressType} from '@motorove/shared';
import {BottomSheetRef} from '@components/BottomSheet/BottomSheet';
import {WizardHandle, WizardStep} from '@components/Wizard/Wizard';
import {EnumUtils} from '@utils/enumUtils';
import {Language} from '@motorove/shared';
import {EventType} from '@motorove/shared/enums/event-type.enum';
import {useLanguage} from '@contexts/LanguageContext';

export const CreateEventScreen: React.FC = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<MainScreenNavigationProp<'CreateEvent'>>();
  const {language} = useLanguage();

  // Refs
  const meetingPointMapBottomSheetRef = useRef<BottomSheetRef>(null);
  const startLocationMapBottomSheetRef = useRef<BottomSheetRef>(null);
  const finishLocationMapBottomSheetRef = useRef<BottomSheetRef>(null);
  const wizardRef = useRef<WizardHandle>(null);
  const exitDialogRef = useRef<any>(null);
  const draftDialogRef = useRef<any>(null);

  // State hooks
  const [selectedEventType, setSelectedEventType] =
    useState<DropdownItem | null>(null);
  const [selectedRoadType, setSelectedRoadType] = useState<DropdownItem | null>(
    null,
  );
  const [selectedDifficultyLevel, setSelectedDifficultyLevel] =
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
  const [selectedMeetingPoint, setSelectedMeetingPoint] = useState<{
    latitude?: number;
    longitude?: number;
    name?: string;
    addresses?: any[];
  }>({});
  const [selectedStartLocation, setSelectedStartLocation] = useState<{
    latitude?: number;
    longitude?: number;
    name?: string;
    addresses?: any[];
  }>({});
  const [selectedFinishLocation, setSelectedFinishLocation] = useState<{
    latitude?: number;
    longitude?: number;
    name?: string;
    addresses?: any[];
  }>({});
  const [activeInviteTab, setActiveInviteTab] = useState<string>('users');

  // Enum hooks
  const eventTypes = EnumUtils.getEventTypes();
  const roadTypes = EnumUtils.getRoadTypes();
  const difficultyLevels = EnumUtils.getDifficultyLevels();
  const experienceLevels = EnumUtils.getExperienceLevels();

  // Form setup with Zod validation
  const methods = useForm<CreateEventFormValues>({
    resolver: zodResolver(eventSchemas(t).createEventSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      meetingPoint: '',
      startLocation: '',
      finishLocation: '',
      startDate: new Date(),
      startTime: new Date(),
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
      difficultyLevel: '',
      restStops: '',
      campingInfo: '',
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
  const isSoloRide = useMemo(
    () => eventType === EventType.SOLO_RIDE,
    [eventType],
  );
  const isRideOrCamping = useMemo(
    () =>
      [
        EventType.SOLO_RIDE,
        EventType.GROUP_RIDE,
        EventType.CAMPING_RIDE,
        EventType.SOCIAL_RESPONSIBILITY,
      ].includes((eventType as EventType) || ''),
    [eventType],
  );
  const isWorkshop = useMemo(
    () => eventType === EventType.TRAINING,
    [eventType],
  );
  const shouldShowEventDetails = useMemo(
    () => isRideOrCamping || isWorkshop,
    [isRideOrCamping, isWorkshop],
  );

  // Set navigation options to disable iOS swipe back gesture when dirty
  useLayoutEffect(() => {
    if (Platform.OS === 'ios') {
      navigation.setOptions({
        gestureEnabled: !isDirty, // Disable swipe back when form is dirty
      });
    }

    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (isDirty) {
            exitDialogRef.current?.open();
            return true; // Prevent default behavior
          }
          return false; // Allow default behavior
        },
      );
      return () => backHandler.remove();
    }
  }, [navigation, isDirty]);

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
        text1: t('common.success'),
        text2: t('screens.event.draft_saved'),
      });
    } catch (error) {
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.event.draft_save_failed'),
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
    meetingPointMapBottomSheetRef.current?.open('full');
  }, []);

  const handleOpenStartLocationMap = useCallback(() => {
    startLocationMapBottomSheetRef.current?.open('full');
  }, []);

  const handleOpenFinishLocationMap = useCallback(() => {
    finishLocationMapBottomSheetRef.current?.open('full');
  }, []);

  const handleLocationSelect = useCallback(
    (addresses: ICreateAddress[]) => {
      if (addresses.length === 0) {
        // Reset if no addresses provided
        setSelectedMeetingPoint({});
        setValue('meetingPoint', '', {shouldValidate: true});
        return;
      }

      // Get the first address to extract coordinates
      const firstAddress = addresses[0];
      setSelectedMeetingPoint({
        latitude: firstAddress.latitude,
        longitude: firstAddress.longitude,
      });

      // Get display address (prefer English)
      const displayAddress = addresses.find(
        addr => addr.language.toLowerCase() === language.toLowerCase(),
      );

      // Set the meetingPoint field value
      setValue('meetingPoint', displayAddress?.address || '', {
        shouldValidate: true,
      });

      // Close the bottom sheet
      meetingPointMapBottomSheetRef.current?.close();
    },
    [setValue],
  );

  const handleStartLocationSelect = useCallback(
    (addresses: ICreateAddress[]) => {
      if (addresses.length === 0) {
        // Reset if no addresses provided
        setSelectedStartLocation({});
        setValue('startLocation', '', {shouldValidate: true});
        return;
      }

      // Get the first address to extract coordinates
      const firstAddress = addresses[0];
      setSelectedStartLocation({
        latitude: firstAddress.latitude,
        longitude: firstAddress.longitude,
      });

      // Get display address (prefer English)
      const displayAddress = addresses.find(
        addr => addr.language.toLowerCase() === language.toLowerCase(),
      );

      // Set the startLocation field value
      setValue('startLocation', displayAddress?.address || '', {
        shouldValidate: true,
      });

      // Close the bottom sheet
      startLocationMapBottomSheetRef.current?.close();
    },
    [setValue],
  );

  const handleFinishLocationSelect = useCallback(
    (addresses: ICreateAddress[]) => {
      if (addresses.length === 0) {
        // Reset if no addresses provided
        setSelectedFinishLocation({});
        setValue('finishLocation', '', {shouldValidate: true});
        return;
      }

      // Get the first address to extract coordinates
      const firstAddress = addresses[0];
      setSelectedFinishLocation({
        latitude: firstAddress.latitude,
        longitude: firstAddress.longitude,
      });

      // Get display address (prefer English)
      const displayAddress = addresses.find(
        addr => addr.language.toLowerCase() === language.toLowerCase(),
      );

      // Set the finishLocation field value
      setValue('finishLocation', displayAddress?.address || '', {
        shouldValidate: true,
      });

      // Close the bottom sheet
      finishLocationMapBottomSheetRef.current?.close();
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
          text1: t('screens.event.limit_reached'),
          text2: t('screens.event.max_images_limit'),
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
            text1: t('screens.event.file_too_large'),
            text2: t('screens.event.image_size_limit'),
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
      loggingService.error('Error selecting event image:', error);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.event.image_selection_failed'),
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
      setSelectedDifficultyLevel(item);
      setValue('difficultyLevel', item?.value || '', {shouldValidate: true});
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

  // Tab change handler for invite tabs
  const handleTabChange = useCallback((key: string) => {
    setActiveInviteTab(key);
  }, []);

  // Form validation functions
  const validateBasicInfo = useCallback(async () => {
    return await trigger([
      'title',
      'eventType',
      'maxParticipants',
      'description',
      'meetingPoint',
    ]);
  }, [trigger]);

  const validateDateTime = useCallback(async () => {
    const fieldsToValidate = [
      'startDate',
      'startTime',
      'endDate',
      'endTime',
      'isPrivate',
    ];

    // Add conditional fields based on privacy settings
    if (isPrivate) {
      fieldsToValidate.push('invitedUsers', 'invitedGroups');
    }

    return await trigger(fieldsToValidate as (keyof CreateEventFormValues)[]);
  }, [trigger, isPrivate]);

  const validateEventSpecificDetails = useCallback(async () => {
    if (isRideOrCamping) {
      const fieldsToValidate: (keyof CreateEventFormValues)[] = [
        'roadType',
        'difficultyLevel',
        'startLocation',
        'finishLocation',
      ];

      if (eventType === EventType.CAMPING_RIDE) {
        fieldsToValidate.push('campingInfo');
      }

      fieldsToValidate.push('equipmentChecklist');

      return await trigger(fieldsToValidate);
    } else if (isWorkshop) {
      return await trigger([
        'instructorInfo',
        'topicsCovered',
        'experienceLevel',
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
          text1: t('common.success'),
          text2: t('screens.event.creation_success'),
        });

        // Navigate back after successful creation
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      } catch (error) {
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2:
            error instanceof Error
              ? error.message
              : t('screens.event.creation_failed'),
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
        title: t('screens.event.basic_info_title'),
        validate: validateBasicInfo,
        content: (
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
                label={t('screens.event.title_label')}
                error={errors.title}
                key="title-input"
              />

              {/* Event Type Dropdown */}
              <Dropdown
                data={eventTypes}
                label={t('screens.event.type_label')}
                onSelect={handleEventTypeSelect}
                placeholder=""
                selectedItem={selectedEventType}
                error={errors.eventType?.message}
                disabled={loading}
                key="eventType-dropdown"
              />

              {/* Meeting Point */}
              <AnimatedInput
                control={control}
                name="meetingPoint"
                label={t('screens.event.meeting_point_label')}
                error={errors.meetingPoint}
                icon={
                  <Icon name="map-pin" size={20} color={colors.neutral.grey} />
                }
                iconPosition="right"
                onPress={handleOpenLocationMap}
                editable={false}
                key="meetingPoint-input"
                testID="meetingPoint-input"
              />

              {/* Max Participants */}
              <AnimatedInput
                control={control}
                name="maxParticipants"
                label={t('screens.event.max_participants_label')}
                error={errors.maxParticipants}
                keyboardType="numeric"
                key="maxParticipants-input"
                testID="maxParticipants-input"
              />

              {/* Event Description */}
              <AnimatedInput
                control={control}
                name="description"
                label={t('screens.event.description_label')}
                multiline
                showClearButton={false}
                error={errors.description}
                key="description-input"
              />
            </View>

            {/* Event Images Section */}
            <View style={styles.imagesSection}>
              <Typography variant="body" style={styles.sectionTitle}>
                {t('screens.event.event_images')}
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
          </KeyboardAwareScrollView>
        ),
      },
      {
        id: 'date-time',
        title: t('screens.event.date_time_title'),
        validate: validateDateTime,
        content: (
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            keyboardShouldPersistTaps="handled"
            style={styles.scrollView}>
            <View style={styles.formFields}>
              <View style={styles.dateTimeContainer}>
                <DateTimePicker
                  control={control}
                  name="startDate"
                  placeholder={t('screens.event.start_date')}
                  cancelText={t('common.cancel')}
                  confirmText={t('common.confirm')}
                  displayFormat="medium"
                  mode="date"
                  minimumDate={new Date()}
                  style={styles.dateTimePicker}
                  error={errors.startDate}
                  key="startDate-picker"
                  locale={language}
                />
                <DateTimePicker
                  control={control}
                  name="startTime"
                  placeholder={t('screens.event.start_time')}
                  cancelText={t('common.cancel')}
                  confirmText={t('common.confirm')}
                  mode="time"
                  minuteInterval={15}
                  style={styles.dateTimePicker}
                  error={errors.startTime}
                  key="startTime-picker"
                  locale={language}
                />
              </View>

              {/* End Date and Time */}
              <View style={styles.dateTimeContainer}>
                <DateTimePicker
                  control={control}
                  name="endDate"
                  placeholder={t('screens.event.end_date')}
                  cancelText={t('common.cancel')}
                  confirmText={t('common.confirm')}
                  displayFormat="medium"
                  mode="date"
                  minimumDate={new Date()}
                  style={styles.dateTimePicker}
                  error={errors.endDate}
                  key="endDate-picker"
                  locale={language}
                />
                <DateTimePicker
                  control={control}
                  name="endTime"
                  placeholder={t('screens.event.end_time')}
                  cancelText={t('common.cancel')}
                  confirmText={t('common.confirm')}
                  mode="time"
                  minuteInterval={15}
                  style={styles.dateTimePicker}
                  error={errors.endTime}
                  key="endTime-picker"
                  locale={language}
                />
              </View>

              {/* Privacy Settings */}
              <View>
                <Typography
                  variant="body"
                  weight="semiBold"
                  style={styles.subSectionTitle}>
                  {t('screens.event.privacy_settings')}
                </Typography>

                {/* Privacy Switch */}
                <View style={styles.privacySwitchContainer}>
                  <Switch
                    value={isPrivate}
                    onValueChange={togglePrivacy}
                    label={t('screens.event.private_event_label')}
                    description={t('screens.event.private_event_description')}
                    style={{paddingVertical: spacing.md}}
                  />
                </View>

                {/* Group/User Selectors for Private Events */}
                {isPrivate && (
                  <View style={styles.privateEventSection}>
                    <Tabs
                      items={[
                        {key: 'users', label: t('common.users')},
                        {key: 'groups', label: t('common.groups')},
                      ]}
                      selectedKey={activeInviteTab}
                      onTabChange={handleTabChange}
                      variant="pill"
                      equalWidth={true}
                    />

                    {activeInviteTab === 'users' && (
                      <View style={styles.tabContent}>
                        <UserSelector
                          selectedUsers={selectedUsers}
                          onUsersChange={handleUsersChange}
                          maxUsers={10}
                        />
                      </View>
                    )}

                    {activeInviteTab === 'groups' && (
                      <View style={styles.tabContent}>
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
          </KeyboardAwareScrollView>
        ),
      },

      {
        id: 'event-details',
        title: t('screens.event.event_details_title'),
        validate: validateEventSpecificDetails,
        content: (
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
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
                      label={t('screens.event.start_location_label')}
                      error={errors.startLocation}
                      icon={
                        <Icon
                          name="map-pin"
                          size={20}
                          color={colors.neutral.grey}
                        />
                      }
                      iconPosition="right"
                      onPress={handleOpenStartLocationMap}
                      editable={false}
                      key="startLocation-input"
                      testID="startLocation-input"
                    />

                    <AnimatedInput
                      control={control}
                      name="finishLocation"
                      label={t('screens.event.finish_location_label')}
                      error={errors.finishLocation}
                      icon={
                        <Icon
                          name="map-pin"
                          size={20}
                          color={colors.neutral.grey}
                        />
                      }
                      iconPosition="right"
                      onPress={handleOpenFinishLocationMap}
                      editable={false}
                      key="finishLocation-input"
                      testID="finishLocation-input"
                    />

                    <Dropdown
                      data={roadTypes}
                      label={t('screens.event.road_type_label')}
                      onSelect={handleRoadTypeSelect}
                      placeholder=""
                      selectedItem={selectedRoadType}
                      error={errors.roadType?.message}
                      key="roadType-dropdown"
                    />

                    <Dropdown
                      data={difficultyLevels}
                      label={t('screens.event.difficulty_level_label')}
                      onSelect={handleDifficultySelect}
                      placeholder=""
                      selectedItem={selectedDifficultyLevel}
                      error={errors.difficultyLevel?.message}
                      key="difficultyLevel-dropdown"
                    />

                    {/* Camping specific */}
                    {eventType === 'CAMPING_RIDE' && (
                      <AnimatedInput
                        control={control}
                        name="campingInfo"
                        label={t('screens.event.camping_info_label')}
                        multiline
                        showClearButton={false}
                        error={errors.campingInfo}
                        key="campingInfo-input"
                      />
                    )}

                    <AnimatedInput
                      control={control}
                      name="routeDescription"
                      label={t('screens.event.route_description_label')}
                      multiline
                      showClearButton={false}
                      error={errors.routeDescription}
                      key="routeDescription-input"
                    />

                    <AnimatedInput
                      control={control}
                      name="restStops"
                      label={t('screens.event.rest_stops_label')}
                      multiline
                      showClearButton={false}
                      error={errors.restStops}
                      key="restStops-input"
                    />

                    <AnimatedInput
                      control={control}
                      name="equipmentChecklist"
                      label={t('screens.event.equipment_checklist_label')}
                      multiline
                      showClearButton={false}
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
                      label={t('screens.event.instructor_info_label')}
                      multiline
                      showClearButton={false}
                      error={errors.instructorInfo}
                      key="instructorInfo-input"
                    />

                    <AnimatedInput
                      control={control}
                      name="topicsCovered"
                      label={t('screens.event.topics_covered_label')}
                      multiline
                      showClearButton={false}
                      error={errors.topicsCovered}
                      key="topicsCovered-input"
                    />

                    <Dropdown
                      data={experienceLevels}
                      label={t('screens.event.experience_level_label')}
                      onSelect={handleExperienceLevelSelect}
                      placeholder=""
                      selectedItem={selectedExperienceLevel}
                      error={errors.experienceLevel?.message}
                      key="experienceLevel-dropdown"
                    />

                    <AnimatedInput
                      control={control}
                      name="price"
                      label={t('screens.event.price_label')}
                      keyboardType="numeric"
                      error={errors.price}
                      key="price-input"
                    />
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
      selectedDifficultyLevel,
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
      handleOpenStartLocationMap,
      handleOpenFinishLocationMap,
      selectedFinishLocation,
      activeInviteTab,
      handleTabChange,
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
      resetField('difficultyLevel');
      resetField('restStops');
      resetField('campingInfo');
      resetField('equipmentChecklist');
      resetField('startLocation');
      resetField('finishLocation');

      // Workshop specific fields
      resetField('instructorInfo');
      resetField('topicsCovered');
      resetField('experienceLevel');
      resetField('price');

      // Reset UI state for dropdowns and locations
      setSelectedRoadType(null);
      setSelectedDifficultyLevel(null);
      setSelectedExperienceLevel(null);
      setSelectedStartLocation({});
      setSelectedFinishLocation({});

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
        title={t('screens.event.create_event')}
        showBackButton
        showShadow={false}
        onBackPress={handleGoBack}
        rightIconName={isDirty ? 'check' : undefined}
        onRightButtonPress={isDirty ? handleSaveDraft : undefined}
      />
      <SafeAreaView style={styles.container}>
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
        </FormProvider>
      </SafeAreaView>
      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {isLastStep ? (
          <>
            <Button
              title={t('common.back')}
              variant="outline"
              shape="round"
              onPress={handlePreviousStep}
              style={{flex: 1}}
            />
            <Button
              title={
                loading
                  ? t('screens.event.creating')
                  : t('screens.event.create_event')
              }
              variant="dark"
              shape="round"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={{flex: 1}}
            />
          </>
        ) : isFirstStep ? (
          <Button
            title={t('common.next')}
            variant="dark"
            shape="round"
            onPress={handleNextStep}
            style={{flex: 1}}
          />
        ) : (
          <>
            <Button
              title={t('common.back')}
              variant="outline"
              shape="round"
              onPress={handlePreviousStep}
              style={{flex: 1}}
            />
            <Button
              title={t('common.next')}
              variant="dark"
              shape="round"
              onPress={handleNextStep}
              style={{flex: 1}}
            />
          </>
        )}
      </View>

      {/* Location Map Bottom Sheets */}
      <BottomSheet
        ref={meetingPointMapBottomSheetRef}
        title={t('screens.event.select_meeting_point')}
        closeButtonPosition="top-left"
        enableGestureControl={false}>
        <SelectLocationMap
          onLocationSelect={handleLocationSelect}
          onClose={() => meetingPointMapBottomSheetRef.current?.close()}
          initialAddress={
            selectedMeetingPoint.latitude && selectedMeetingPoint.longitude
              ? {
                  latitude: selectedMeetingPoint.latitude,
                  longitude: selectedMeetingPoint.longitude,
                  address: '',
                  language: language as Language,
                  type: AddressType.EVENT_MEETING_POINT,
                }
              : undefined
          }
          addressType={AddressType.EVENT_MEETING_POINT}
        />
      </BottomSheet>

      <BottomSheet
        ref={startLocationMapBottomSheetRef}
        title={t('screens.event.select_start_location')}
        closeButtonPosition="top-left"
        enableGestureControl={false}>
        <SelectLocationMap
          onLocationSelect={handleStartLocationSelect}
          onClose={() => startLocationMapBottomSheetRef.current?.close()}
          initialAddress={
            selectedStartLocation.latitude && selectedStartLocation.longitude
              ? {
                  latitude: selectedStartLocation.latitude,
                  longitude: selectedStartLocation.longitude,
                  address: '',
                  language: language as Language,
                  type: AddressType.EVENT_START_LOCATION,
                }
              : undefined
          }
          addressType={AddressType.EVENT_START_LOCATION}
        />
      </BottomSheet>

      <BottomSheet
        ref={finishLocationMapBottomSheetRef}
        title={t('screens.event.select_finish_location')}
        closeButtonPosition="top-left"
        enableGestureControl={false}>
        <SelectLocationMap
          onLocationSelect={handleFinishLocationSelect}
          onClose={() => finishLocationMapBottomSheetRef.current?.close()}
          initialAddress={
            selectedFinishLocation.latitude && selectedFinishLocation.longitude
              ? {
                  latitude: selectedFinishLocation.latitude,
                  longitude: selectedFinishLocation.longitude,
                  address: '',
                  language: language as Language,
                  type: AddressType.EVENT_FINISH_LOCATION,
                }
              : undefined
          }
          addressType={AddressType.EVENT_FINISH_LOCATION}
        />
      </BottomSheet>

      {/* Exit Confirmation Dialog */}
      <Dialog
        ref={exitDialogRef}
        variant="confirm"
        title={t('screens.event.discard_dialog_title')}
        message={t('screens.event.discard_dialog_message')}
        confirmButton={{
          text: t('common.confirm'),
          variant: 'primary',
          onPress: confirmExit,
        }}
        cancelButton={{
          text: t('common.cancel'),
          variant: 'outline',
          onPress: () => exitDialogRef.current?.close(),
        }}
      />

      {/* Save Draft Confirmation Dialog */}
      <Dialog
        ref={draftDialogRef}
        variant="confirm"
        title={t('screens.event.save_draft_dialog_title')}
        message={t('screens.event.save_draft_dialog_message')}
        confirmButton={{
          text: t('common.save'),
          variant: 'primary',
          onPress: confirmSaveDraft,
        }}
        cancelButton={{
          text: t('common.cancel'),
          variant: 'outline',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
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
  scrollView: {
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
  },
  formFields: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    gap: spacing.lg,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateTimePicker: {
    marginBottom: spacing.xs,
  },
  privacySwitchContainer: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.lightGrey,
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
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
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
  tabContent: {
    marginTop: spacing.md,
  },
});

export default CreateEventScreen;
