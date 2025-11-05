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
  ActivityIndicator,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  TopHeaderBar,
  AnimatedInput,
  NumberAnimatedInput,
  Button,
  Typography,
  Body,
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
  BottomSheetRef,
  openBottomSheet,
  closeBottomSheet,
} from '@components';
import {colors, commonStyles, radius, spacing} from '@theme';
import {launchImageLibrary} from 'react-native-image-picker';
import {loggingService} from '@services/logging.service';
import {useUpdateEvent, useGetEvent} from '@services/event.service';
import {useGetJoinedGroups} from '@services/group.service';
import {eventSchemas, UpdateEventFormValues} from '@utils/validation';
import {useTranslation} from '@hooks/useTranslation';
import {
  GroupMemberRole,
  AddressType,
  EventType,
  ICreateEvent,
  IUpdateEvent,
  EventStatus,
  RoadType,
  DifficultyLevel,
  ExperienceLevel,
  CURRENCY_FORMATTING,
  Currency,
  DEFAULT_CURRENCY,
  IBaseCreateAddress,
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

  const {updateEvent, loading} = useUpdateEvent(() => {
    navigation.goBack();
  });
  const {
    event,
    loading: eventLoading,
    error: eventError,
  } = useGetEvent(eventId);

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
  const [selectedCurrency, setSelectedCurrency] = useState<DropdownItem | null>(
    null,
  );
  const [selectedOrganizedByGroup, setSelectedOrganizedByGroup] =
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
  const [selectedMeetingLocation, setSelectedMeetingLocation] = useState<
    ICreateEventAddress[] | null
  >();
  const [selectedStartLocation, setSelectedStartLocation] = useState<
    ICreateEventAddress[] | null
  >();
  const [selectedFinishLocation, setSelectedFinishLocation] = useState<
    ICreateEventAddress[] | null
  >();
  const [activeInviteTab, setActiveInviteTab] = useState<string>('users');

  // Enum hooks
  const eventTypes = EnumUtils.getEventTypes();
  const roadTypes = EnumUtils.getRoadTypes();
  const difficultyLevels = EnumUtils.getDifficultyLevels();
  const experienceLevels = EnumUtils.getExperienceLevels();
  const currencies = EnumUtils.getCurrencyDropdownOptions();

  // Organized by group options (Admin Groups only)
  const organizedByGroupOptions = useMemo(() => {
    const options: DropdownItem[] = [];

    // Add admin groups
    adminGroups.forEach(group => {
      options.push({
        id: group.id,
        label: group.name,
        value: group.id,
      });
    });

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

  // Helper function to clean addresses by removing GraphQL-specific fields
  const cleanAddresses = useCallback(
    (
      addresses: ICreateEventAddress[] | null | undefined,
    ): ICreateEventAddress[] => {
      if (!addresses || addresses.length === 0) {
        return [];
      }
      return addresses.map(addr => ({
        type: addr.type,
        latitude: addr.latitude,
        longitude: addr.longitude,
        address: addr.address,
        language: addr.language,
        countryCode: addr.countryCode,
      }));
    },
    [],
  );

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

    if (!selectedImages.length) {
      showToast({
        type: 'error',
        text1: t('validation.event.images.required'),
        text2: t('validation.event.images.image_size_limit'),
      });
      return;
    }

    try {
      const addresses: ICreateEventAddress[] = [
        ...cleanAddresses(selectedMeetingLocation),
        ...cleanAddresses(selectedStartLocation),
        ...cleanAddresses(selectedFinishLocation),
      ];
      // Use base64 encoded images if available, otherwise fall back to URIs
      const images = selectedImages.map(img => img.base64 || img.uri);

      // Parse maxParticipants safely
      const maxParticipantsValue = formData.maxParticipants
        ? parseInt(formData.maxParticipants as string, 10)
        : undefined;
      if (maxParticipantsValue && isNaN(maxParticipantsValue)) {
        throw new Error('Invalid maxParticipants value');
      }

      const createEventInput: ICreateEvent = {
        title: formData.title,
        description: formData.description,
        isPrivate: formData.isPrivate,
        invitedGroupIds: formData.isPrivate ? formData.invitedGroups || [] : [],
        invitedUserIds: formData.isPrivate ? formData.invitedUsers || [] : [],
        organizedByGroupId:
          formData.organizedByGroupId &&
          formData.organizedByGroupId.trim() !== ''
            ? formData.organizedByGroupId
            : undefined,
        eventType: formData.eventType as EventType,
        status: EventStatus.DRAFT,
        addresses: addresses.length > 0 ? addresses : [],
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
        maxParticipants: maxParticipantsValue,
        images: images,
        // Only include fields if they have values
        ...(formData.roadType &&
          formData.roadType.trim() !== '' && {
            roadType: formData.roadType as RoadType,
          }),
        ...(formData.difficultyLevel &&
          formData.difficultyLevel.trim() !== '' && {
            difficultyLevel: formData.difficultyLevel as DifficultyLevel,
          }),
        ...(formData.experienceLevel &&
          formData.experienceLevel.trim() !== '' && {
            experienceLevel: formData.experienceLevel as ExperienceLevel,
          }),
        ...(formData.routeDescription &&
          formData.routeDescription.trim() !== '' && {
            routeDescription: formData.routeDescription,
          }),
        ...(formData.restStops &&
          formData.restStops.trim() !== '' && {
            restStops: formData.restStops,
          }),
        ...(formData.campingInfo &&
          formData.campingInfo.trim() !== '' && {
            campingInfo: formData.campingInfo,
          }),
        ...(formData.equipmentChecklist &&
          formData.equipmentChecklist.trim() !== '' && {
            equipmentChecklist: formData.equipmentChecklist,
          }),
        ...(formData.instructorInfo &&
          formData.instructorInfo.trim() !== '' && {
            instructorInfo: formData.instructorInfo,
          }),
        ...(formData.topicsCovered &&
          formData.topicsCovered.trim() !== '' && {
            topicsCovered: formData.topicsCovered,
          }),
        ...(formData.price &&
          formData.price.trim() !== '' && {
            price: formData.price,
          }),
        ...(formData.currency &&
          formData.currency.trim() !== '' && {
            currency: formData.currency as Currency,
          }),
      };

      await updateEvent({...createEventInput, id: eventId});
    } catch (error) {
      loggingService.error('Error saving draft:', error);
    }
  }, [
    getValues,
    selectedMeetingLocation,
    selectedStartLocation,
    selectedFinishLocation,
    selectedImages,
    t,
    updateEvent,
    eventId,
    cleanAddresses,
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

  const handleMeetingLocationSelect = useCallback(
    (addresses: IBaseCreateAddress[]) => {
      if (addresses.length === 0) {
        // Reset if no addresses provided
        setSelectedMeetingLocation(null);
        setValue('meetingLocation', '', {
          shouldValidate: true,
          shouldDirty: true,
        });
        return;
      }

      const addressesWithTypes = addresses.map(addr => ({
        ...addr,
        type: AddressType.EVENT_MEETING_LOCATION,
      }));
      setSelectedMeetingLocation(addressesWithTypes);

      const displayAddress = addresses.find(
        addr => addr.language.toLowerCase() === language.toLowerCase(),
      );

      // Set the meetingLocation field value
      setValue('meetingLocation', displayAddress?.address || '', {
        shouldValidate: true,
        shouldDirty: true,
      });

      // Close the bottom sheet
      meetingLocationMapBottomSheetRef.current?.close();
    },
    [setValue, language],
  );

  const handleStartLocationSelect = useCallback(
    (addresses: IBaseCreateAddress[]) => {
      if (addresses.length === 0) {
        // Reset if no addresses provided
        setSelectedStartLocation(null);
        setValue('startLocation', '', {
          shouldValidate: true,
          shouldDirty: true,
        });
        return;
      }

      const addressesWithTypes = addresses.map(addr => ({
        ...addr,
        type: AddressType.EVENT_START_LOCATION,
      }));
      setSelectedStartLocation(addressesWithTypes);

      const displayAddress = addresses.find(
        addr => addr.language.toLowerCase() === language.toLowerCase(),
      );

      // Set the startLocation field value
      setValue('startLocation', displayAddress?.address || '', {
        shouldValidate: true,
        shouldDirty: true,
      });

      // Close the bottom sheet
      startLocationMapBottomSheetRef.current?.close();
    },
    [setValue, language],
  );

  const handleFinishLocationSelect = useCallback(
    (addresses: IBaseCreateAddress[]) => {
      if (addresses.length === 0) {
        // Reset if no addresses provided
        setSelectedFinishLocation(null);
        setValue('finishLocation', '', {
          shouldValidate: true,
          shouldDirty: true,
        });
        return;
      }

      const addressesWithTypes = addresses.map(addr => ({
        ...addr,
        type: AddressType.EVENT_FINISH_LOCATION,
      }));
      setSelectedFinishLocation(addressesWithTypes);

      const displayAddress = addresses.find(
        addr => addr.language.toLowerCase() === language.toLowerCase(),
      );

      // Set the finishLocation field value
      setValue('finishLocation', displayAddress?.address || '', {
        shouldValidate: true,
        shouldDirty: true,
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
        setValue('images', imageData, {
          shouldValidate: true,
          shouldDirty: true,
        });
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
      setValue('images', imageData, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [selectedImages, setValue],
  );

  // Dropdown selection handlers
  const handleEventTypeSelect = useCallback(
    (item: DropdownItem | null) => {
      setSelectedEventType(item);
      setValue('eventType', item?.value || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue],
  );

  const handleRoadTypeSelect = useCallback(
    (item: DropdownItem | null) => {
      setSelectedRoadType(item);
      setValue('roadType', item?.value || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue],
  );

  const handleDifficultySelect = useCallback(
    (item: DropdownItem | null) => {
      setSelectedDifficultyLevel(item);
      setValue('difficultyLevel', item?.value || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue],
  );

  const handleExperienceLevelSelect = useCallback(
    (item: DropdownItem | null) => {
      setSelectedExperienceLevel(item);
      setValue('experienceLevel', item?.value || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue],
  );

  const handleCurrencySelect = useCallback(
    (item: DropdownItem | null) => {
      setSelectedCurrency(item);
      setValue('currency', item?.value || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue],
  );

  const handleOrganizedByGroupSelect = useCallback(
    (item: DropdownItem | null) => {
      setSelectedOrganizedByGroup(item);
      setValue('organizedByGroupId', item?.value || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue],
  );

  // Toggle handlers
  const togglePrivacy = useCallback(
    (newValue: boolean) => {
      setIsPrivate(newValue);
      setValue('isPrivate', newValue, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue],
  );

  // Group and user selection handlers
  const handleGroupsChange = useCallback(
    (groupIds: string[]) => {
      setSelectedGroups(groupIds);
      setValue('invitedGroups', groupIds, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue],
  );

  const handleUsersChange = useCallback(
    (userIds: string[]) => {
      setSelectedUsers(userIds);
      setValue('invitedUsers', userIds, {
        shouldValidate: true,
        shouldDirty: true,
      });
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
        'price',
        'currency',
      ] as const);
    }
    return true;
  }, [isRideOrCamping, isWorkshop, eventType, trigger]);

  // Form submission handler
  const onSubmit = useCallback(
    async (data: UpdateEventFormValues) => {
      try {
        const addresses: ICreateEventAddress[] = [
          ...cleanAddresses(selectedMeetingLocation),
          ...cleanAddresses(selectedStartLocation),
          ...cleanAddresses(selectedFinishLocation),
        ];
        // Use base64 encoded images if available, otherwise fall back to URIs
        const images = selectedImages.map(img => img.base64 || img.uri);

        // Parse maxParticipants safely
        const maxParticipantsValue = data.maxParticipants
          ? parseInt(data.maxParticipants as string, 10)
          : undefined;
        if (maxParticipantsValue && isNaN(maxParticipantsValue)) {
          throw new Error('Invalid maxParticipants value');
        }

        const updateEventInput: IUpdateEvent = {
          id: eventId,
          title: data.title,
          description: data.description,
          isPrivate: data.isPrivate,
          eventType: selectedEventType?.value as EventType,
          status: EventStatus.UPCOMING,
          addresses: addresses.length > 0 ? addresses : undefined,
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
          maxParticipants: maxParticipantsValue,
          images: images,
          // Only include optional fields if they have values
          ...(data.invitedGroups &&
            data.invitedGroups.length > 0 && {
              invitedGroupIds: data.invitedGroups,
            }),
          ...(data.invitedUsers &&
            data.invitedUsers.length > 0 && {
              invitedUserIds: data.invitedUsers,
            }),
          ...(data.organizedByGroupId &&
            data.organizedByGroupId.trim() !== '' && {
              organizedByGroupId: data.organizedByGroupId,
            }),
          // Include specific fields based on event type (only if they have values)
          ...(data.routeDescription &&
            data.routeDescription.trim() !== '' && {
              routeDescription: data.routeDescription,
            }),
          ...(data.roadType &&
            data.roadType.trim() !== '' && {
              roadType: data.roadType as RoadType,
            }),
          ...(data.difficultyLevel &&
            data.difficultyLevel.trim() !== '' && {
              difficultyLevel: data.difficultyLevel as DifficultyLevel,
            }),
          ...(data.restStops &&
            data.restStops.trim() !== '' && {
              restStops: data.restStops,
            }),
          ...(data.campingInfo &&
            data.campingInfo.trim() !== '' && {
              campingInfo: data.campingInfo,
            }),
          ...(data.equipmentChecklist &&
            data.equipmentChecklist.trim() !== '' && {
              equipmentChecklist: data.equipmentChecklist,
            }),
          ...(data.instructorInfo &&
            data.instructorInfo.trim() !== '' && {
              instructorInfo: data.instructorInfo,
            }),
          ...(data.topicsCovered &&
            data.topicsCovered.trim() !== '' && {
              topicsCovered: data.topicsCovered,
            }),
          ...(data.experienceLevel &&
            data.experienceLevel.trim() !== '' && {
              experienceLevel: data.experienceLevel as ExperienceLevel,
            }),
          ...(data.price &&
            data.price.trim() !== '' && {
              price: data.price,
            }),
          ...(data.currency &&
            data.currency.trim() !== '' && {
              currency: data.currency as Currency,
            }),
        };

        await updateEvent(updateEventInput);
      } catch (error) {
        loggingService.error('Error updating event:', error);
      }
    },
    [
      updateEvent,
      eventId,
      selectedMeetingLocation,
      selectedStartLocation,
      selectedFinishLocation,
      selectedImages,
      selectedEventType,
      cleanAddresses,
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
            enableResetScrollToCoords={false}
            keyboardShouldPersistTaps="handled"
            style={styles.scrollView}>
            <View style={styles.formFields}>
              {/* Event Title */}
              <AnimatedInput
                control={control}
                name="title"
                label={t('screens.event.event_title')}
                error={errors.title}
                key="title-input"
              />

              {/* Event Type Dropdown */}
              <Dropdown
                data={eventTypes}
                label={t('screens.event.event_type')}
                onSelect={handleEventTypeSelect}
                placeholder=""
                selectedItem={selectedEventType}
                error={errors.eventType?.message}
                showClearButton={false}
                key="eventType-dropdown"
              />

              {/* Event organized by group */}
              <Dropdown
                data={organizedByGroupOptions}
                label={t('screens.event.organized_by_group')}
                onSelect={handleOrganizedByGroupSelect}
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
                error={errors.meetingLocation}
                icon={
                  <Icon
                    name="map-pin-filled"
                    size={20}
                    color={colors.neutral.grey}
                  />
                }
                iconPosition="right"
                onPress={handleOpenLocationMap}
                showClearButton={false}
                editable={false}
                key="meetingLocation-input"
                testID="meetingLocation-input"
              />

              {/* Max Participants */}
              <AnimatedInput
                control={control}
                name="maxParticipants"
                label={t('screens.event.max_participants')}
                error={errors.maxParticipants}
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
            enableResetScrollToCoords={false}
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
                    label={t('screens.event.private_event')}
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
                      label={t('screens.event.finish_location')}
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
                      label={t('screens.event.road_type')}
                      onSelect={handleRoadTypeSelect}
                      placeholder=""
                      selectedItem={selectedRoadType}
                      error={errors.roadType?.message}
                      key="roadType-dropdown"
                    />

                    <Dropdown
                      data={difficultyLevels}
                      label={t('screens.event.difficulty_level')}
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
                        label={t('screens.event.camping_info')}
                        multiline
                        showClearButton={false}
                        error={errors.campingInfo}
                        key="campingInfo-input"
                      />
                    )}

                    <AnimatedInput
                      control={control}
                      name="routeDescription"
                      label={t('screens.event.route_description')}
                      multiline
                      showClearButton={false}
                      error={errors.routeDescription}
                      key="routeDescription-input"
                    />

                    <AnimatedInput
                      control={control}
                      name="restStops"
                      label={t('screens.event.rest_stops')}
                      multiline
                      showClearButton={false}
                      error={errors.restStops}
                      key="restStops-input"
                    />

                    <AnimatedInput
                      control={control}
                      name="equipmentChecklist"
                      label={t('screens.event.equipment_checklist')}
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
                      label={t('screens.event.instructor_info')}
                      multiline
                      showClearButton={false}
                      error={errors.instructorInfo}
                      key="instructorInfo-input"
                    />

                    <AnimatedInput
                      control={control}
                      name="topicsCovered"
                      label={t('screens.event.topics_covered')}
                      multiline
                      showClearButton={false}
                      error={errors.topicsCovered}
                      key="topicsCovered-input"
                    />

                    <Dropdown
                      data={experienceLevels}
                      label={t('screens.event.experience_level')}
                      onSelect={handleExperienceLevelSelect}
                      placeholder=""
                      selectedItem={selectedExperienceLevel}
                      error={errors.experienceLevel?.message}
                      key="experienceLevel-dropdown"
                    />

                    <View
                      style={{
                        flexDirection: 'row',
                        gap: spacing.md,
                      }}>
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
                          error={errors.price}
                          testID="price-input"
                        />
                      </View>
                      <View style={{flex: 1}}>
                        <Dropdown
                          data={currencies}
                          label={t('screens.event.currency')}
                          onSelect={handleCurrencySelect}
                          selectedItem={selectedCurrency}
                          showClearButton={false}
                          error={errors.currency?.message}
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
      currencies,
      selectedCurrency,
      handleCurrencySelect,
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

  // Reset fields when event type changes (only if form is already populated and eventType actually changed)
  useEffect(() => {
    // Only reset if:
    // 1. Form has been populated (initial load is complete)
    // 2. EventType has actually changed (not initial set)
    // 3. EventType is not empty
    if (
      eventType &&
      isFormPopulatedRef.current &&
      previousEventTypeRef.current !== undefined &&
      previousEventTypeRef.current !== eventType
    ) {
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
      resetField('currency');

      // Reset UI state for dropdowns and locations
      setSelectedRoadType(null);
      setValue('roadType', '', {shouldValidate: false});
      setSelectedDifficultyLevel(null);
      setValue('difficultyLevel', '', {shouldValidate: false});
      setSelectedExperienceLevel(null);
      setValue('experienceLevel', '', {shouldValidate: false});
      setSelectedStartLocation(null);
      setValue('startLocation', '', {shouldValidate: false});
      setSelectedFinishLocation(null);
      setValue('finishLocation', '', {shouldValidate: false});
      setSelectedCurrency(null);
      setValue('currency', '', {shouldValidate: false});

      // If we're past the first step, jump back to first step
      if (currentStepIndex > 0) {
        setTimeout(() => {
          wizardRef.current?.jumpToStep(0);
        }, 0);
      }
    }

    // Update the previous eventType ref
    if (eventType) {
      previousEventTypeRef.current = eventType;
    }
  }, [eventType, resetField, setValue, currentStepIndex]);

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
          setSelectedEventType(eventTypeItem);
          formValues.eventType = event.eventType as EventType;
        }
      }

      // Set event-specific fields in formValues and update UI state
      if (event.roadType) {
        const roadTypeItem = roadTypes.find(
          type => type.value === event.roadType,
        );
        if (roadTypeItem) {
          setSelectedRoadType(roadTypeItem);
          formValues.roadType = event.roadType;
        }
      }

      if (event.difficultyLevel) {
        const difficultyItem = difficultyLevels.find(
          level => level.value === event.difficultyLevel,
        );
        if (difficultyItem) {
          setSelectedDifficultyLevel(difficultyItem);
          formValues.difficultyLevel = event.difficultyLevel;
        }
      }

      if (event.experienceLevel) {
        const experienceItem = experienceLevels.find(
          level => level.value === event.experienceLevel,
        );
        if (experienceItem) {
          setSelectedExperienceLevel(experienceItem);
          formValues.experienceLevel = event.experienceLevel;
        }
      }

      // Set currency if available
      if (event.currency) {
        const currencyItem = currencies.find(
          curr => curr.value === event.currency,
        );
        if (currencyItem) {
          setSelectedCurrency(currencyItem);
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
          setSelectedMeetingLocation(meetingLocationAddresses);
          const displayAddress =
            meetingLocationAddresses.find(
              addr => addr.language.toLowerCase() === language.toLowerCase(),
            ) || meetingLocationAddresses[0];
          formValues.meetingLocation = displayAddress?.address || '';
        }

        if (startLocationAddresses.length > 0) {
          setSelectedStartLocation(startLocationAddresses);
          const displayAddress =
            startLocationAddresses.find(
              addr => addr.language.toLowerCase() === language.toLowerCase(),
            ) || startLocationAddresses[0];
          formValues.startLocation = displayAddress?.address || '';
        }

        if (finishLocationAddresses.length > 0) {
          setSelectedFinishLocation(finishLocationAddresses);
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
        setSelectedImages(imageObjects);
        formValues.images = event.images.map(img => img.url);
      }

      // Set organized by group field
      const eventData = event as any;
      if (eventData.organizedByGroup) {
        const organizedByGroupItem = organizedByGroupOptions.find(
          option => option.value === eventData.organizedByGroup.id,
        );
        if (organizedByGroupItem) {
          setSelectedOrganizedByGroup(organizedByGroupItem);
          formValues.organizedByGroupId = eventData.organizedByGroup.id;
        }
      }

      // Set invited users and groups (if they exist in the event data)
      if (eventData.invitedUsers && Array.isArray(eventData.invitedUsers)) {
        const invitedUserIds = eventData.invitedUsers.map(
          (user: any) => user.id,
        );
        setSelectedUsers(invitedUserIds);
        formValues.invitedUsers = invitedUserIds;
      }
      if (eventData.invitedGroups && Array.isArray(eventData.invitedGroups)) {
        const invitedGroupIds = eventData.invitedGroups.map(
          (group: any) => group.id,
        );
        setSelectedGroups(invitedGroupIds);
        formValues.invitedGroups = invitedGroupIds;
      }

      // Update privacy state
      setIsPrivate(event.isPrivate || false);

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
    setIsPrivate,
    setSelectedEventType,
    setSelectedRoadType,
    setSelectedDifficultyLevel,
    setSelectedExperienceLevel,
    setSelectedCurrency,
    setSelectedOrganizedByGroup,
    setSelectedMeetingLocation,
    setSelectedStartLocation,
    setSelectedFinishLocation,
    setSelectedImages,
    setSelectedUsers,
    setSelectedGroups,
    t,
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
              title={t('screens.event.create_event')}
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
        ref={meetingLocationMapBottomSheetRef}
        title={t('screens.event.select_meeting_location')}
        closeButtonPosition="top-right"
        enableGestureControl={false}>
        <SelectLocationMap
          initialAddress={selectedMeetingLocation?.find(
            address =>
              address.language.toLowerCase() === language.toLowerCase(),
          )}
          onLocationSelect={handleMeetingLocationSelect}
          onClose={() => meetingLocationMapBottomSheetRef.current?.close()}
        />
      </BottomSheet>

      <BottomSheet
        ref={startLocationMapBottomSheetRef}
        title={t('screens.event.select_start_location')}
        closeButtonPosition="top-right"
        enableGestureControl={false}>
        <SelectLocationMap
          initialAddress={selectedStartLocation?.find(
            address =>
              address.language.toLowerCase() === language.toLowerCase(),
          )}
          onLocationSelect={handleStartLocationSelect}
          onClose={() => startLocationMapBottomSheetRef.current?.close()}
        />
      </BottomSheet>

      <BottomSheet
        ref={finishLocationMapBottomSheetRef}
        title={t('screens.event.select_finish_location')}
        closeButtonPosition="top-right"
        enableGestureControl={false}>
        <SelectLocationMap
          initialAddress={selectedFinishLocation?.find(
            address =>
              address.language.toLowerCase() === language.toLowerCase(),
          )}
          onLocationSelect={handleFinishLocationSelect}
          onClose={() => finishLocationMapBottomSheetRef.current?.close()}
        />
      </BottomSheet>
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
