import React, {
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useLayoutEffect,
  useState,
} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  BackHandler,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  TopHeaderBar,
  Button,
  Body,
  Typography,
  showToast,
  BottomSheet,
  SelectLocationMap,
  Wizard,
  BottomSheetRef,
  openBottomSheet,
  closeBottomSheet,
  LoadingIndicator,
} from '@components';
import {
  BasicInfoStep,
  DateTimeStep,
  EventDetailsStep,
} from '@components/EventForm';
import {colors, commonStyles, spacing} from '@theme';
import {loggingService} from '@services/logging.service';
import {useUpdateEvent, useGetEvent} from '@services/event.service';
import {useGetJoinedGroups} from '@services/group.service';
import {eventSchemas, UpdateEventFormValues} from '@utils/validation';
import {useTranslation} from '@hooks/useTranslation';
import {useEventForm} from '@hooks/useEventForm';
import {useEventImages} from '@hooks/useEventImages';
import {useEventLocations} from '@hooks/useEventLocations';
import {useEventHandlers} from '@hooks/useEventHandlers';
import {buildEventInput} from '@utils/eventFormHelpers';
import {
  GroupMemberRole,
  AddressType,
  EventType,
  EventStatus,
  ICreateEventAddress,
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

export const EditEventScreen = ({route}: EditEventScreenProps) => {
  const {t} = useTranslation();
  const navigation = useNavigation<MainScreenNavigationProp<'EditEvent'>>();
  const {eventId} = route.params;
  const {language} = useLanguage();

  const {updateEvent, loading: updateEventLoading} = useUpdateEvent(() => {
    navigation.goBack();
  });
  const {
    event,
    loading: eventLoading,
    error: eventError,
  } = useGetEvent(eventId);

  // Check if event is upcoming to restrict certain fields
  const isEventUpcoming = event?.status === EventStatus.UPCOMING;

  // Get user admin groups for organized by dropdown
  const {
    groups: adminGroups,
    loading: adminGroupsLoading,
    applyFilters,
  } = useGetJoinedGroups();

  // Refs
  const meetingLocationMapBottomSheetRef = useRef<BottomSheetRef>(null);
  const startLocationMapBottomSheetRef = useRef<BottomSheetRef>(null);
  const finishLocationMapBottomSheetRef = useRef<BottomSheetRef>(null);
  const wizardRef = useRef<WizardHandle>(null);
  const isFormPopulatedRef = useRef<boolean>(false);
  const previousEventTypeRef = useRef<string | undefined>(undefined);

  // Wizard step state
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [isLastStep, setIsLastStep] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Use shared event form hook
  const eventFormState = useEventForm();

  // Enum hooks
  const eventTypes = EnumUtils.getEventTypes();
  const roadTypes = EnumUtils.getRoadTypes();
  const difficultyLevels = EnumUtils.getDifficultyLevels();
  const experienceLevels = EnumUtils.getExperienceLevels();
  const currencies = EnumUtils.getCurrencyDropdownOptions();

  // Organized by group options (Admin Groups only)
  const organizedByGroupOptions = useMemo(() => {
    const options = adminGroups.map(group => ({
      id: group.id,
      label: group.name,
      value: group.id,
    }));
    return options;
  }, [adminGroups]);

  // Form setup with Zod validation
  const methods = useForm<UpdateEventFormValues>({
    resolver: zodResolver(eventSchemas(t).updateEventSchema) as any,
    defaultValues: {
      id: eventId,
      title: '',
      description: '',
      meetingLocation: '',
      startLocation: '',
      finishLocation: '',
      startDate: new Date(),
      startTime: new Date(),
      endDate: new Date(),
      endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
      maxParticipants: null,
      images: [],
      isPrivate: false,
      invitedGroups: [],
      invitedUsers: [],
      eventType: undefined,
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
      currency: '',
      // Organized by fields
      organizedByGroupId: '',
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
    reset,
  } = methods;

  // Watch key form values with fallback defaults
  const startDate = watch('startDate') ?? new Date();
  const endDate = watch('endDate') ?? new Date();
  const startTime = watch('startTime') ?? new Date();
  const endTime =
    watch('endTime') ?? new Date(new Date().getTime() + 2 * 60 * 60 * 1000);

  // Use shared image handling hook
  const {handleSelectImage, handleRemoveImage} = useEventImages({
    selectedImages: eventFormState.selectedImages,
    setSelectedImages: eventFormState.setSelectedImages,
    setValue: setValue as (name: string, value: any, options?: any) => void,
  });

  // Use shared location handling hook
  const {
    handleMeetingLocationSelect,
    handleStartLocationSelect,
    handleFinishLocationSelect,
  } = useEventLocations({
    setValue: setValue as (name: string, value: any, options?: any) => void,
    setSelectedMeetingLocation: eventFormState.setSelectedMeetingLocation,
    setSelectedStartLocation: eventFormState.setSelectedStartLocation,
    setSelectedFinishLocation: eventFormState.setSelectedFinishLocation,
    language,
  });

  // Use shared event handlers hook
  const eventHandlers = useEventHandlers({
    setValue: setValue as (name: string, value: any, options?: any) => void,
    setSelectedEventType: eventFormState.setSelectedEventType,
    setSelectedRoadType: eventFormState.setSelectedRoadType,
    setSelectedDifficultyLevel: eventFormState.setSelectedDifficultyLevel,
    setSelectedExperienceLevel: eventFormState.setSelectedExperienceLevel,
    setSelectedCurrency: eventFormState.setSelectedCurrency,
    setSelectedOrganizedByGroup: eventFormState.setSelectedOrganizedByGroup,
    setIsPrivate: eventFormState.setIsPrivate,
    setSelectedGroups: eventFormState.setSelectedGroups,
    setSelectedUsers: eventFormState.setSelectedUsers,
    setActiveInviteTab: eventFormState.setActiveInviteTab,
  });

  // Navigation handlers
  const handleGoBack = useCallback(() => {
    if (isDirty) {
      openBottomSheet({
        title: t('screens.event.discard_dialog_title'),
        snapPoint: 'minimal',
        showCloseButton: false,
        closeOnBackdropPress: true,
        enableGestureControl: false,
        content: (
          <View style={styles.bottomSheetContent}>
            <Body style={styles.bottomSheetMessage}>
              {t('screens.event.discard_dialog_message')}
            </Body>
            <View style={styles.bottomSheetButtons}>
              <Button
                title={t('common.cancel')}
                variant="outline"
                shape="round"
                onPress={() => closeBottomSheet()}
                style={styles.bottomSheetButton}
              />
              <Button
                title={t('common.confirm')}
                variant="primary"
                shape="round"
                onPress={() => {
                  closeBottomSheet();
                  navigation.goBack();
                }}
                style={styles.bottomSheetButton}
              />
            </View>
          </View>
        ),
      });
    } else {
      navigation.goBack();
    }
  }, [navigation, isDirty, t]);

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
            handleGoBack();
            return true; // Prevent default behavior
          }
          return false; // Allow default behavior
        },
      );
      return () => backHandler.remove();
    }

    applyFilters({
      role: GroupMemberRole.ADMIN,
    });
  }, [navigation, isDirty, applyFilters, handleGoBack]);

  const confirmSaveDraft = useCallback(async () => {
    const formData = getValues();

    if (!formData.eventType) {
      showToast({
        type: 'error',
        text1: t('validation.event.event_type.required'),
        text2: t('validation.event.event_type.select'),
      });
      return;
    }

    if (!eventFormState.selectedImages.length) {
      showToast({
        type: 'error',
        text1: t('validation.event.images.required'),
        text2: t('validation.event.images.image_size_limit'),
      });
      return;
    }

    try {
      const eventInput = buildEventInput(
        formData,
        eventFormState.selectedImages,
        eventFormState.selectedMeetingLocation,
        eventFormState.selectedStartLocation,
        eventFormState.selectedFinishLocation,
        EventStatus.DRAFT,
      );

      await updateEvent({...eventInput, id: eventId});
    } catch (error) {
      loggingService.error('Error saving draft:', error);
    }
  }, [
    getValues,
    eventFormState.selectedImages,
    eventFormState.selectedMeetingLocation,
    eventFormState.selectedStartLocation,
    eventFormState.selectedFinishLocation,
    updateEvent,
    eventId,
    t,
  ]);

  const handleSaveDraft = useCallback(() => {
    openBottomSheet({
      title: t('screens.event.save_draft_dialog_title'),
      snapPoint: 'minimal',
      showCloseButton: false,
      closeOnBackdropPress: true,
      enableGestureControl: false,
      content: (
        <View style={styles.bottomSheetContent}>
          <Body style={styles.bottomSheetMessage}>
            {t('screens.event.save_draft_dialog_message')}
          </Body>
          <View style={styles.bottomSheetButtons}>
            <Button
              title={t('common.cancel')}
              variant="outline"
              shape="round"
              onPress={() => closeBottomSheet()}
              style={styles.bottomSheetButton}
            />
            <Button
              title={t('common.save')}
              variant="primary"
              shape="round"
              onPress={async () => {
                closeBottomSheet();
                await confirmSaveDraft();
              }}
              style={styles.bottomSheetButton}
            />
          </View>
        </View>
      ),
    });
  }, [t, confirmSaveDraft]);

  const handleNextStep = useCallback(async () => {
    wizardRef.current?.nextStep();
  }, []);

  const handlePreviousStep = useCallback(() => {
    wizardRef.current?.previousStep();
  }, []);

  // Location selection handlers
  const handleOpenLocationMap = useCallback(() => {
    meetingLocationMapBottomSheetRef.current?.open('full');
  }, []);

  const handleOpenStartLocationMap = useCallback(() => {
    startLocationMapBottomSheetRef.current?.open('full');
  }, []);

  const handleOpenFinishLocationMap = useCallback(() => {
    finishLocationMapBottomSheetRef.current?.open('full');
  }, []);

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
      'meetingLocation',
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

    if (eventFormState.isPrivate) {
      fieldsToValidate.push('invitedUsers', 'invitedGroups');
    }

    return await trigger(fieldsToValidate as (keyof UpdateEventFormValues)[]);
  }, [trigger, eventFormState.isPrivate]);

  const validateEventSpecificDetails = useCallback(async () => {
    if (eventFormState.isRideOrCamping) {
      const fieldsToValidate: (keyof UpdateEventFormValues)[] = [
        'roadType',
        'difficultyLevel',
        'startLocation',
        'finishLocation',
      ];

      if (eventFormState.eventType === EventType.CAMPING_RIDE) {
        fieldsToValidate.push('campingInfo');
      }

      fieldsToValidate.push('equipmentChecklist');

      return await trigger(fieldsToValidate);
    } else if (eventFormState.isWorkshop) {
      return await trigger([
        'instructorInfo',
        'topicsCovered',
        'experienceLevel',
        'price',
        'currency',
      ] as const);
    }
    return true;
  }, [
    eventFormState.isRideOrCamping,
    eventFormState.isWorkshop,
    eventFormState.eventType,
    trigger,
  ]);

  // Form submission handler
  const onSubmit = useCallback(
    async (data: UpdateEventFormValues) => {
      try {
        const eventInput = buildEventInput(
          data,
          eventFormState.selectedImages,
          eventFormState.selectedMeetingLocation,
          eventFormState.selectedStartLocation,
          eventFormState.selectedFinishLocation,
          EventStatus.UPCOMING,
        );

        await updateEvent({...eventInput, id: eventId});
      } catch (error) {
        loggingService.error('Error updating event:', error);
      }
    },
    [
      eventFormState.selectedImages,
      eventFormState.selectedMeetingLocation,
      eventFormState.selectedStartLocation,
      eventFormState.selectedFinishLocation,
      updateEvent,
      eventId,
    ],
  );

  const handleWizardComplete = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  // Define wizard steps using shared components
  const baseWizardSteps = useMemo<WizardStep[]>(
    () => [
      {
        id: 'basic-info',
        title: t('screens.event.basic_info_title'),
        validate: validateBasicInfo,
        content: (
          <BasicInfoStep
            control={control}
            errors={errors}
            eventTypes={eventTypes}
            selectedEventType={eventFormState.selectedEventType}
            onEventTypeSelect={eventHandlers.handleEventTypeSelect}
            organizedByGroupOptions={organizedByGroupOptions}
            selectedOrganizedByGroup={eventFormState.selectedOrganizedByGroup}
            onOrganizedByGroupSelect={
              eventHandlers.handleOrganizedByGroupSelect
            }
            adminGroupsLoading={adminGroupsLoading}
            selectedImages={eventFormState.selectedImages}
            onSelectImage={handleSelectImage}
            onRemoveImage={handleRemoveImage}
            onOpenLocationMap={handleOpenLocationMap}
            disableRestrictedFields={isEventUpcoming}
          />
        ),
      },
      {
        id: 'date-time',
        title: t('screens.event.date_time_title'),
        validate: validateDateTime,
        content: (
          <DateTimeStep
            control={control}
            errors={errors}
            startDate={startDate}
            startTime={startTime}
            endDate={endDate}
            endTime={endTime}
            language={language}
            isPrivate={eventFormState.isPrivate}
            onTogglePrivacy={eventHandlers.togglePrivacy}
            activeInviteTab={eventFormState.activeInviteTab}
            onTabChange={eventHandlers.handleTabChange}
            selectedUsers={eventFormState.selectedUsers}
            onUsersChange={eventHandlers.handleUsersChange}
            selectedGroups={eventFormState.selectedGroups}
            onGroupsChange={eventHandlers.handleGroupsChange}
            disableRestrictedFields={isEventUpcoming}
          />
        ),
      },
      {
        id: 'event-details',
        title: t('screens.event.event_details_title'),
        validate: validateEventSpecificDetails,
        content: (
          <EventDetailsStep
            control={control}
            errors={errors}
            eventType={eventFormState.eventType}
            isRideOrCamping={eventFormState.isRideOrCamping}
            isWorkshop={eventFormState.isWorkshop}
            roadTypes={roadTypes}
            selectedRoadType={eventFormState.selectedRoadType}
            onRoadTypeSelect={eventHandlers.handleRoadTypeSelect}
            difficultyLevels={difficultyLevels}
            selectedDifficultyLevel={eventFormState.selectedDifficultyLevel}
            onDifficultySelect={eventHandlers.handleDifficultySelect}
            experienceLevels={experienceLevels}
            selectedExperienceLevel={eventFormState.selectedExperienceLevel}
            onExperienceLevelSelect={eventHandlers.handleExperienceLevelSelect}
            currencies={currencies}
            selectedCurrency={eventFormState.selectedCurrency}
            onCurrencySelect={eventHandlers.handleCurrencySelect}
            onOpenStartLocationMap={handleOpenStartLocationMap}
            onOpenFinishLocationMap={handleOpenFinishLocationMap}
          />
        ),
      },
    ],
    [
      t,
      validateBasicInfo,
      validateDateTime,
      validateEventSpecificDetails,
      control,
      errors,
      eventTypes,
      eventFormState,
      eventHandlers,
      organizedByGroupOptions,
      adminGroupsLoading,
      handleSelectImage,
      handleRemoveImage,
      handleOpenLocationMap,
      startDate,
      startTime,
      endDate,
      endTime,
      language,
      roadTypes,
      difficultyLevels,
      experienceLevels,
      currencies,
      handleOpenStartLocationMap,
      handleOpenFinishLocationMap,
      isEventUpcoming,
    ],
  );

  // Filter steps based on event type
  const wizardSteps = useMemo(
    () =>
      eventFormState.shouldShowEventDetails
        ? baseWizardSteps
        : baseWizardSteps.filter(step => step.id !== 'event-details'),
    [eventFormState.shouldShowEventDetails, baseWizardSteps],
  );

  // Reset fields when event type changes
  useEffect(() => {
    if (
      eventFormState.eventType &&
      isFormPopulatedRef.current &&
      previousEventTypeRef.current !== undefined &&
      previousEventTypeRef.current !== eventFormState.eventType
    ) {
      // Clear all event-type specific fields
      resetField('routeDescription');
      resetField('roadType');
      resetField('difficultyLevel');
      resetField('restStops');
      resetField('campingInfo');
      resetField('equipmentChecklist');
      resetField('startLocation');
      resetField('finishLocation');
      resetField('instructorInfo');
      resetField('topicsCovered');
      resetField('experienceLevel');
      resetField('price');
      resetField('currency');

      // Reset UI state using shared hook's reset function
      eventFormState.resetEventTypeSpecificFields();

      // If we're past the first step, jump back to first step
      if (currentStepIndex > 0) {
        setTimeout(() => {
          wizardRef.current?.jumpToStep(0);
        }, 0);
      }
    }

    // Update the previous eventType ref
    if (eventFormState.eventType) {
      previousEventTypeRef.current = eventFormState.eventType;
    }
  }, [eventFormState.eventType, resetField, currentStepIndex]);

  // Update step status when wizard step changes
  useEffect(() => {
    setIsFirstStep(currentStepIndex === 0);
    setIsLastStep(currentStepIndex === wizardSteps.length - 1);
  }, [currentStepIndex, wizardSteps.length]);

  // Pre-populate form with existing event data
  useEffect(() => {
    if (event && !eventLoading && !eventError && !isFormPopulatedRef.current) {
      // Prepare form values object
      const formValues: UpdateEventFormValues = {
        id: eventId,
        title: event.title || '',
        description: event.description || '',
        maxParticipants: event.maxParticipants?.toString() || null,
        isPrivate: event.isPrivate || false,
        invitedGroups: [],
        invitedUsers: [],
        eventType: (event.eventType as EventType) || undefined,
        routeDescription: event.routeDescription || '',
        roadType: event.roadType || '',
        difficultyLevel: event.difficultyLevel || '',
        restStops: event.restStops || '',
        campingInfo: event.campingInfo || '',
        equipmentChecklist: event.equipmentChecklist || '',
        instructorInfo: event.instructorInfo || '',
        topicsCovered: event.topicsCovered || '',
        experienceLevel: event.experienceLevel || '',
        price: event.price?.toString() || '',
        currency: event.currency || '',
        organizedByGroupId: '',
        meetingLocation: '',
        startLocation: '',
        finishLocation: '',
        images: event.images?.map(img => img.url) || [],
        startDate: event.startDateTime
          ? new Date(event.startDateTime)
          : new Date(),
        startTime: event.startDateTime
          ? new Date(event.startDateTime)
          : new Date(),
        endDate: event.endDateTime ? new Date(event.endDateTime) : new Date(),
        endTime: event.endDateTime
          ? new Date(event.endDateTime)
          : new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
      };

      // Set dates and times
      if (event.startDateTime) {
        const startDateTime = new Date(event.startDateTime);
        formValues.startDate = startDateTime;
        formValues.startTime = startDateTime;
      }
      if (event.endDateTime) {
        const endDateTime = new Date(event.endDateTime);
        formValues.endDate = endDateTime;
        formValues.endTime = endDateTime;
      }

      // Set event type first (before other fields that depend on it)
      // Initialize previousEventTypeRef to prevent reset during population
      if (event.eventType) {
        previousEventTypeRef.current = event.eventType;
        const eventTypeItem = eventTypes.find(
          type => type.value === event.eventType,
        );
        if (eventTypeItem) {
          eventFormState.setSelectedEventType(eventTypeItem);
          formValues.eventType = event.eventType as EventType;
        }
      }

      // Set event-specific fields in formValues and update UI state
      if (event.roadType) {
        const roadTypeItem = roadTypes.find(
          type => type.value === event.roadType,
        );
        if (roadTypeItem) {
          eventFormState.setSelectedRoadType(roadTypeItem);
          formValues.roadType = event.roadType;
        }
      }

      if (event.difficultyLevel) {
        const difficultyItem = difficultyLevels.find(
          level => level.value === event.difficultyLevel,
        );
        if (difficultyItem) {
          eventFormState.setSelectedDifficultyLevel(difficultyItem);
          formValues.difficultyLevel = event.difficultyLevel;
        }
      }

      if (event.experienceLevel) {
        const experienceItem = experienceLevels.find(
          level => level.value === event.experienceLevel,
        );
        if (experienceItem) {
          eventFormState.setSelectedExperienceLevel(experienceItem);
          formValues.experienceLevel = event.experienceLevel;
        }
      }

      // Set currency if available
      if (event.currency) {
        const currencyItem = currencies.find(
          curr => curr.value === event.currency,
        );
        if (currencyItem) {
          eventFormState.setSelectedCurrency(currencyItem);
          formValues.currency = event.currency;
        }
      }

      // Set addresses (clean GraphQL-specific fields)
      if (event.addresses && event.addresses.length > 0) {
        const meetingLocationAddresses = event.addresses
          .filter(addr => addr.type === AddressType.EVENT_MEETING_LOCATION)
          .map(addr => ({
            type: addr.type,
            latitude: addr.latitude,
            longitude: addr.longitude,
            address: addr.address,
            language: addr.language,
            countryCode: addr.countryCode,
          })) as ICreateEventAddress[];

        const startLocationAddresses = event.addresses
          .filter(addr => addr.type === AddressType.EVENT_START_LOCATION)
          .map(addr => ({
            type: addr.type,
            latitude: addr.latitude,
            longitude: addr.longitude,
            address: addr.address,
            language: addr.language,
            countryCode: addr.countryCode,
          })) as ICreateEventAddress[];

        const finishLocationAddresses = event.addresses
          .filter(addr => addr.type === AddressType.EVENT_FINISH_LOCATION)
          .map(addr => ({
            type: addr.type,
            latitude: addr.latitude,
            longitude: addr.longitude,
            address: addr.address,
            language: addr.language,
            countryCode: addr.countryCode,
          })) as ICreateEventAddress[];

        if (meetingLocationAddresses.length > 0) {
          eventFormState.setSelectedMeetingLocation(meetingLocationAddresses);
          const displayAddress =
            meetingLocationAddresses.find(
              addr => addr.language.toLowerCase() === language.toLowerCase(),
            ) || meetingLocationAddresses[0];
          formValues.meetingLocation = displayAddress?.address || '';
        }

        if (startLocationAddresses.length > 0) {
          eventFormState.setSelectedStartLocation(startLocationAddresses);
          const displayAddress =
            startLocationAddresses.find(
              addr => addr.language.toLowerCase() === language.toLowerCase(),
            ) || startLocationAddresses[0];
          formValues.startLocation = displayAddress?.address || '';
        }

        if (finishLocationAddresses.length > 0) {
          eventFormState.setSelectedFinishLocation(finishLocationAddresses);
          const displayAddress =
            finishLocationAddresses.find(
              addr => addr.language.toLowerCase() === language.toLowerCase(),
            ) || finishLocationAddresses[0];
          formValues.finishLocation = displayAddress?.address || '';
        }
      }

      // Set images
      if (event.images && event.images.length > 0) {
        const imageObjects = event.images.map((image, index) => ({
          id: Date.now() + index,
          uri: image.url,
          base64: image.url.startsWith('data:') ? image.url : undefined,
        }));
        eventFormState.setSelectedImages(imageObjects);
        formValues.images = event.images.map(img => img.url);
      }

      // Set organized by group field
      const eventData = event as any;
      if (eventData.organizedByGroup) {
        const organizedByGroupItem = organizedByGroupOptions.find(
          option => option.value === eventData.organizedByGroup.id,
        );
        if (organizedByGroupItem) {
          eventFormState.setSelectedOrganizedByGroup(organizedByGroupItem);
          formValues.organizedByGroupId = eventData.organizedByGroup.id;
        }
      }

      // Set invited users and groups (if they exist in the event data)
      if (eventData.invitedUsers && Array.isArray(eventData.invitedUsers)) {
        const invitedUserIds = eventData.invitedUsers.map(
          (user: any) => user.id,
        );
        eventFormState.setSelectedUsers(invitedUserIds);
        formValues.invitedUsers = invitedUserIds;
      }
      if (eventData.invitedGroups && Array.isArray(eventData.invitedGroups)) {
        const invitedGroupIds = eventData.invitedGroups.map(
          (group: any) => group.id,
        );
        eventFormState.setSelectedGroups(invitedGroupIds);
        formValues.invitedGroups = invitedGroupIds;
      }

      // Update privacy state
      eventFormState.setIsPrivate(event.isPrivate || false);

      // Reset form with loaded values - this updates default values for dirty tracking
      reset(formValues, {keepDefaultValues: false});

      // Mark form as populated AFTER all fields are set
      // This prevents the reset useEffect from clearing fields during population
      isFormPopulatedRef.current = true;
    } else if (eventLoading || eventError) {
      // Reset the flag if we're loading again or there's an error
      isFormPopulatedRef.current = false;
      previousEventTypeRef.current = undefined;
    }
  }, [
    event,
    eventLoading,
    eventError,
    eventId,
    eventTypes,
    roadTypes,
    difficultyLevels,
    experienceLevels,
    currencies,
    organizedByGroupOptions,
    language,
    reset,
    eventFormState.setIsPrivate,
    eventFormState.setSelectedEventType,
    eventFormState.setSelectedRoadType,
    eventFormState.setSelectedDifficultyLevel,
    eventFormState.setSelectedExperienceLevel,
    eventFormState.setSelectedCurrency,
    eventFormState.setSelectedOrganizedByGroup,
    eventFormState.setSelectedMeetingLocation,
    eventFormState.setSelectedStartLocation,
    eventFormState.setSelectedFinishLocation,
    eventFormState.setSelectedImages,
    eventFormState.setSelectedUsers,
    eventFormState.setSelectedGroups,
  ]);

  // Show loading state while fetching event data
  if (eventLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
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
        rightIconName={
          isDirty && event?.status === EventStatus.DRAFT ? 'check' : undefined
        }
        onRightButtonPress={
          isDirty && event?.status === EventStatus.DRAFT
            ? handleSaveDraft
            : undefined
        }
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
                isEventUpcoming
                  ? t('common.update')
                  : t('screens.event.create_event')
              }
              variant="dark"
              shape="round"
              onPress={handleSubmit(onSubmit)}
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
        ref={meetingLocationMapBottomSheetRef}
        title={t('screens.event.select_meeting_location')}
        closeButtonPosition="top-right"
        enableGestureControl={false}>
        <SelectLocationMap
          initialAddress={eventFormState.selectedMeetingLocation?.find(
            address =>
              address.language.toLowerCase() === language.toLowerCase(),
          )}
          onLocationSelect={addresses => {
            handleMeetingLocationSelect(addresses);
            meetingLocationMapBottomSheetRef.current?.close();
          }}
          onClose={() => meetingLocationMapBottomSheetRef.current?.close()}
        />
      </BottomSheet>

      <BottomSheet
        ref={startLocationMapBottomSheetRef}
        title={t('screens.event.select_start_location')}
        closeButtonPosition="top-right"
        enableGestureControl={false}>
        <SelectLocationMap
          initialAddress={eventFormState.selectedStartLocation?.find(
            address =>
              address.language.toLowerCase() === language.toLowerCase(),
          )}
          onLocationSelect={addresses => {
            handleStartLocationSelect(addresses);
            startLocationMapBottomSheetRef.current?.close();
          }}
          onClose={() => startLocationMapBottomSheetRef.current?.close()}
        />
      </BottomSheet>

      <BottomSheet
        ref={finishLocationMapBottomSheetRef}
        title={t('screens.event.select_finish_location')}
        closeButtonPosition="top-right"
        enableGestureControl={false}>
        <SelectLocationMap
          initialAddress={eventFormState.selectedFinishLocation?.find(
            address =>
              address.language.toLowerCase() === language.toLowerCase(),
          )}
          onLocationSelect={addresses => {
            handleFinishLocationSelect(addresses);
            finishLocationMapBottomSheetRef.current?.close();
          }}
          onClose={() => finishLocationMapBottomSheetRef.current?.close()}
        />
      </BottomSheet>
      <LoadingIndicator visible={updateEventLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  wizardContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
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
  bottomSheetContent: {
    padding: spacing.sm,
  },
  bottomSheetMessage: {
    textAlign: 'center',
  },
  bottomSheetButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  bottomSheetButton: {
    flex: 1,
    width: '50%',
  },
});

export default EditEventScreen;
