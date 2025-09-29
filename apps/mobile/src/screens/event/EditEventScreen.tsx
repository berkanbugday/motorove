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
  Dialog,
  BottomSheetRef,
} from '@components';
import {colors, commonStyles, radius, spacing} from '@theme';
import {launchImageLibrary} from 'react-native-image-picker';
import {loggingService} from '@services/logging.service';
import {useUpdateEvent, useGetEvent} from '@services/event.service';
import {eventSchemas, UpdateEventFormValues} from '@utils/validation';
import {useTranslation} from '@hooks/useTranslation';
import {
  ICreateAddress,
  AddressType,
  EventType,
  ICreateEvent,
  EventStatus,
  RoadType,
  DifficultyLevel,
  ExperienceLevel,
} from '@motorove/shared';
import {WizardHandle, WizardStep} from '@components/Wizard/Wizard';
import {EnumUtils} from '@utils/enumUtils';
import {useLanguage} from '@contexts/LanguageContext';

interface EditEventScreenProps {
  route: {
    params: {
      eventId: string;
    };
  };
}

export const EditEventScreen: React.FC<EditEventScreenProps> = ({route}) => {
  const {t} = useTranslation();
  const navigation = useNavigation<MainScreenNavigationProp<'CreateEvent'>>();
  const {eventId} = route.params;
  const {language} = useLanguage();
  const {updateEvent, loading} = useUpdateEvent(() => {
    navigation.goBack();
  });
  const {
    event,
    loading: eventLoading,
    error: eventError,
  } = useGetEvent(eventId);

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
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [isLastStep, setIsLastStep] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedMeetingPoint, setSelectedMeetingPoint] = useState<
    ICreateAddress[] | null
  >();
  const [selectedStartLocation, setSelectedStartLocation] = useState<
    ICreateAddress[] | null
  >();
  const [selectedFinishLocation, setSelectedFinishLocation] = useState<
    ICreateAddress[] | null
  >();
  const [activeInviteTab, setActiveInviteTab] = useState<string>('users');

  // Memoized enum arrays to prevent unnecessary re-renders
  const eventTypes = useMemo(() => EnumUtils.getEventTypes(), []);
  const roadTypes = useMemo(() => EnumUtils.getRoadTypes(), []);
  const difficultyLevels = useMemo(() => EnumUtils.getDifficultyLevels(), []);
  const experienceLevels = useMemo(() => EnumUtils.getExperienceLevels(), []);

  // Form setup with Zod validation
  const methods = useForm<UpdateEventFormValues>({
    resolver: zodResolver(eventSchemas(t).updateEventSchema) as any,
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

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const startTime = watch('startTime');
  const endTime = watch('endTime');

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

  const confirmSaveDraft = useCallback(async () => {
    const formData = getValues();

    try {
      const addresses: ICreateAddress[] = [
        ...(selectedMeetingPoint || []),
        ...(selectedStartLocation || []),
        ...(selectedFinishLocation || []),
      ];
      // Use base64 encoded images if available, otherwise fall back to URIs
      const images = selectedImages.map(img => img.base64 || img.uri);

      const createEventInput: ICreateEvent = {
        title: formData.title,
        description: formData.description,
        isPrivate: formData.isPrivate,
        invitedGroupIds: formData.isPrivate ? formData.invitedGroups : [],
        invitedUserIds: formData.isPrivate ? formData.invitedUsers : [],
        eventType: formData.eventType as EventType,
        status: EventStatus.DRAFT,
        addresses: addresses,
        startDateTime: new Date(
          `${formData.startDate.toISOString().split('T')[0]}T${
            formData.startTime.toISOString().split('T')[1]
          }`,
        ).toISOString(),
        endDateTime:
          formData.endDate && formData.endTime
            ? new Date(
                `${formData.endDate.toISOString().split('T')[0]}T${
                  formData.endTime.toISOString().split('T')[1]
                }`,
              ).toISOString()
            : undefined,
        maxParticipants: parseInt(formData.maxParticipants as string, 10),
        images: images,
        roadType: formData.roadType as RoadType,
        difficultyLevel: formData.difficultyLevel as DifficultyLevel,
        experienceLevel: formData.experienceLevel as ExperienceLevel,
        routeDescription: formData.routeDescription,
        restStops: formData.restStops,
        campingInfo: formData.campingInfo,
        equipmentChecklist: formData.equipmentChecklist,
        instructorInfo: formData.instructorInfo,
        topicsCovered: formData.topicsCovered,
        price: formData.price,
      };

      await updateEvent({...createEventInput, id: eventId});
    } catch (error) {
      loggingService.error('Error saving draft:', error);
    }
  }, [
    getValues,
    selectedMeetingPoint,
    selectedStartLocation,
    selectedFinishLocation,
    selectedImages,
  ]);

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

  const handleMeetingLocationSelect = useCallback(
    (addresses: ICreateAddress[]) => {
      if (addresses.length === 0) {
        // Reset if no addresses provided
        setSelectedMeetingPoint(null);
        setValue('meetingPoint', '', {shouldValidate: true});
        return;
      }

      setSelectedMeetingPoint(addresses);

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
    [setValue, language],
  );

  const handleStartLocationSelect = useCallback(
    (addresses: ICreateAddress[]) => {
      if (addresses.length === 0) {
        // Reset if no addresses provided
        setSelectedStartLocation(null);
        setValue('startLocation', '', {shouldValidate: true});
        return;
      }

      setSelectedStartLocation(addresses);

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
    [setValue, language],
  );

  const handleFinishLocationSelect = useCallback(
    (addresses: ICreateAddress[]) => {
      if (addresses.length === 0) {
        // Reset if no addresses provided
        setSelectedFinishLocation(null);
        setValue('finishLocation', '', {shouldValidate: true});
        return;
      }

      setSelectedFinishLocation(addresses);

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
    [setValue, language],
  );

  // Image selection handlers
  const handleSelectImage = useCallback(async () => {
    try {
      // Check if image limit is reached
      if (selectedImages.length >= 3) {
        showToast({
          type: 'error',
          text1: t('validation.event.images.limit_reached'),
          text2: t('validation.event.images.max_images_limit'),
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
            text1: t('validation.event.images.file_too_large'),
            text2: t('validation.event.images.image_size_limit'),
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
      'images',
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

    return await trigger(fieldsToValidate as (keyof UpdateEventFormValues)[]);
  }, [trigger, isPrivate]);

  const validateEventSpecificDetails = useCallback(async () => {
    if (isRideOrCamping) {
      const fieldsToValidate: (keyof UpdateEventFormValues)[] = [
        'roadType',
        'difficultyLevel',
        'startLocation',
        'finishLocation',
      ];

      if (eventType === EventType.CAMPING_RIDE) {
        fieldsToValidate.push('campingInfo');
      }

      fieldsToValidate.push('equipmentChecklist');

      return await trigger(fieldsToValidate as (keyof UpdateEventFormValues)[]);
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
    async (data: UpdateEventFormValues) => {
      try {
        const addresses: ICreateAddress[] = [
          ...(selectedMeetingPoint || []),
          ...(selectedStartLocation || []),
          ...(selectedFinishLocation || []),
        ];
        // Use base64 encoded images if available, otherwise fall back to URIs
        const images = selectedImages.map(img => img.base64 || img.uri);

        const updateEventInput = {
          id: eventId,
          title: data.title,
          description: data.description,
          isPrivate: data.isPrivate,
          invitedGroupIds: data.invitedGroups,
          invitedUserIds: data.invitedUsers,
          eventType: selectedEventType?.value as EventType,
          status: EventStatus.PUBLISHED,
          addresses: addresses,
          startDateTime: new Date(
            `${data.startDate.toISOString().split('T')[0]}T${
              data.startTime.toISOString().split('T')[1]
            }`,
          ).toISOString(),
          endDateTime:
            data.endDate && data.endTime
              ? new Date(
                  `${data.endDate.toISOString().split('T')[0]}T${
                    data.endTime.toISOString().split('T')[1]
                  }`,
                ).toISOString()
              : undefined,
          maxParticipants: parseInt(data.maxParticipants as string, 10),
          images: images,
          // Include specific fields based on event type
          ...(data.routeDescription && {
            routeDescription: data.routeDescription,
          }),
          ...(data.roadType && {roadType: data.roadType as RoadType}),
          ...(data.difficultyLevel && {
            difficultyLevel: data.difficultyLevel as DifficultyLevel,
          }),
          ...(data.restStops && {restStops: data.restStops}),
          ...(data.campingInfo && {
            campingInfo: data.campingInfo,
          }),
          ...(data.equipmentChecklist && {
            equipmentChecklist: data.equipmentChecklist,
          }),
          ...(data.instructorInfo && {
            instructorInfo: data.instructorInfo,
          }),
          ...(data.topicsCovered && {
            topicsCovered: data.topicsCovered,
          }),
          ...(data.experienceLevel && {
            experienceLevel: data.experienceLevel as ExperienceLevel,
          }),
          ...(data.price && {price: data.price}),
        };

        await updateEvent(updateEventInput);
      } catch (error) {
        loggingService.error('Error creating event:', error);
      }
    },
    [
      updateEvent,
      eventId,
      selectedMeetingPoint,
      selectedStartLocation,
      selectedFinishLocation,
      selectedImages,
      selectedEventType,
    ],
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
                  <Icon
                    name="map-pin-filled"
                    size={20}
                    color={colors.neutral.grey}
                  />
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
              {errors.images && (
                <Typography variant="caption" color={colors.status.error}>
                  {errors.images.message}
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
                    onPress={handleSelectImage}
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
                  displayFormat="long"
                  mode="date"
                  defaultValue={startDate}
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
                  defaultValue={startTime}
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
                  displayFormat="long"
                  mode="date"
                  defaultValue={endDate}
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
                  defaultValue={endTime}
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
                  {/* Group/User Selectors for Private Events */}
                  {isPrivate && (
                    <View style={styles.privateEventSection}>
                      <Tabs
                        items={[
                          {key: 'users', label: t('screens.event.users')},
                          {key: 'groups', label: t('screens.event.groups')},
                        ]}
                        selectedKey={activeInviteTab}
                        onTabChange={handleTabChange}
                        variant="minimal"
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
                          name="map-pin-filled"
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
                          name="map-pin-filled"
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
      handleSelectImage,
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
      setValue('roadType', '', {shouldValidate: false});
      setSelectedDifficultyLevel(null);
      setValue('difficultyLevel', '', {shouldValidate: false});
      setSelectedExperienceLevel(null);
      setValue('experienceLevel', '', {shouldValidate: false});
      setSelectedMeetingPoint(null);
      setValue('meetingPoint', '', {shouldValidate: false});
      setSelectedStartLocation(null);
      setValue('startLocation', '', {shouldValidate: false});
      setSelectedFinishLocation(null);
      setValue('finishLocation', '', {shouldValidate: false});

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

  // Pre-populate form with existing event data
  useEffect(() => {
    if (event && !eventLoading && !eventError) {
      // Set basic form values
      setValue('title', event.title || '');
      setValue('description', event.description || '');
      setValue('maxParticipants', event.maxParticipants?.toString() || '');
      setValue('isPrivate', event.isPrivate || false);
      setIsPrivate(event.isPrivate || false);

      // Set dates and times
      if (event.startDateTime) {
        const startDateTime = new Date(event.startDateTime);
        setValue('startDate', startDateTime);
        setValue('startTime', startDateTime);
      }
      if (event.endDateTime) {
        const endDateTime = new Date(event.endDateTime);
        setValue('endDate', endDateTime);
        setValue('endTime', endDateTime);
      }

      // Set event type
      if (event.eventType) {
        const eventTypeItem = eventTypes.find(
          type => type.value === event.eventType,
        );
        if (eventTypeItem) {
          setSelectedEventType(eventTypeItem);
          setValue('eventType', event.eventType);
        }
      }

      // Set event-specific fields
      if (event.roadType) {
        const roadTypeItem = roadTypes.find(
          type => type.value === event.roadType,
        );
        if (roadTypeItem) {
          setSelectedRoadType(roadTypeItem);
          setValue('roadType', event.roadType);
        }
      }

      if (event.difficultyLevel) {
        const difficultyItem = difficultyLevels.find(
          level => level.value === event.difficultyLevel,
        );
        if (difficultyItem) {
          setSelectedDifficultyLevel(difficultyItem);
          setValue('difficultyLevel', event.difficultyLevel);
        }
      }

      if (event.experienceLevel) {
        const experienceItem = experienceLevels.find(
          level => level.value === event.experienceLevel,
        );
        if (experienceItem) {
          setSelectedExperienceLevel(experienceItem);
          setValue('experienceLevel', event.experienceLevel);
        }
      }

      // Set optional text fields
      setValue('routeDescription', event.routeDescription || '');
      setValue('restStops', event.restStops || '');
      setValue('campingInfo', event.campingInfo || '');
      setValue('equipmentChecklist', event.equipmentChecklist || '');
      setValue('instructorInfo', event.instructorInfo || '');
      setValue('topicsCovered', event.topicsCovered || '');
      setValue('price', event.price?.toString() || '');

      // Set addresses
      if (event.addresses && event.addresses.length > 0) {
        const meetingPointAddresses = event.addresses.filter(
          addr => addr.type === AddressType.EVENT_MEETING_POINT,
        );
        const startLocationAddresses = event.addresses.filter(
          addr => addr.type === AddressType.EVENT_START_LOCATION,
        );
        const finishLocationAddresses = event.addresses.filter(
          addr => addr.type === AddressType.EVENT_FINISH_LOCATION,
        );

        if (meetingPointAddresses.length > 0) {
          setSelectedMeetingPoint(meetingPointAddresses);
          const displayAddress = meetingPointAddresses.find(
            addr => addr.language.toLowerCase() === language.toLowerCase(),
          );
          setValue(
            'meetingPoint',
            displayAddress?.address || meetingPointAddresses[0].address,
          );
        }

        if (startLocationAddresses.length > 0) {
          setSelectedStartLocation(startLocationAddresses);
          const displayAddress = startLocationAddresses.find(
            addr => addr.language.toLowerCase() === language.toLowerCase(),
          );
          setValue(
            'startLocation',
            displayAddress?.address || startLocationAddresses[0].address,
          );
        }

        if (finishLocationAddresses.length > 0) {
          setSelectedFinishLocation(finishLocationAddresses);
          const displayAddress = finishLocationAddresses.find(
            addr => addr.language.toLowerCase() === language.toLowerCase(),
          );
          setValue(
            'finishLocation',
            displayAddress?.address || finishLocationAddresses[0].address,
          );
        }
      }

      // Set images
      if (event.images && event.images.length > 0) {
        const imageObjects = event.images.map((imageUrl, index) => ({
          id: Date.now() + index,
          uri: imageUrl,
          base64: imageUrl.startsWith('data:') ? imageUrl : undefined,
        }));
        setSelectedImages(imageObjects);
        setValue('images', event.images);
      }

      // Set invited users and groups (if they exist in the event data)
      // Note: These fields might not be available in the IEvent interface
      // but could be part of the actual event data from the API
      const eventData = event as any;
      if (eventData.invitedUserIds) {
        setSelectedUsers(eventData.invitedUserIds);
        setValue('invitedUsers', eventData.invitedUserIds);
      }
      if (eventData.invitedGroupIds) {
        setSelectedGroups(eventData.invitedGroupIds);
        setValue('invitedGroups', eventData.invitedGroupIds);
      }
    }
  }, [
    event,
    eventLoading,
    eventError,
    eventTypes,
    roadTypes,
    difficultyLevels,
    experienceLevels,
    language,
  ]);

  // Show loading state while fetching event data
  if (eventLoading) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <TopHeaderBar
          title={t('screens.event.edit_event')}
          showBackButton
          showShadow={false}
          onBackPress={() => navigation.goBack()}
        />
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Typography variant="body">{t('common.loading')}</Typography>
        </View>
      </View>
    );
  }

  // Show error state if event couldn't be loaded
  if (eventError || !event) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <TopHeaderBar
          title={t('screens.event.edit_event')}
          showBackButton
          showShadow={false}
          onBackPress={() => navigation.goBack()}
        />
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Typography variant="body" color={colors.status.error}>
            {t('screens.event.error_loading_event')}
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.event.edit_event')}
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
              title={t('screens.event.update_event')}
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
          onLocationSelect={handleMeetingLocationSelect}
          onClose={() => meetingPointMapBottomSheetRef.current?.close()}
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
    flex: 1,
    marginBottom: spacing.xs,
  },
  privacySwitchContainer: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.lightGrey,
  },
  privateEventSection: {
    margin: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGrey,
    paddingVertical: spacing.md,
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

export default EditEventScreen;
