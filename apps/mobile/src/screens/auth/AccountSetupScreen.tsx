import React, {useState, useRef, useCallback, useMemo, useEffect} from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  useWindowDimensions,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {AuthScreenNavigationProp} from '@navigation/types/navigationTypes';
import {
  Button,
  Wizard,
  WizardHandle,
  WizardStep,
  TopHeaderBar,
  Dropdown,
  DropdownItem,
  Title,
  BodySmall,
  Body,
  DateTimePicker,
  MultiSelect,
  MultiSelectItem,
  Icon,
  showToast,
} from '@components';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  createAuthSchemas,
  AccountSetupFormValues,
} from '@utils/validation/authValidation';
import {colors, fontSizes, spacing, radius, getShadow} from '@theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {loggingService} from '@services/logging.service';
import {useTranslation} from '@hooks/useTranslation';
import {useAuth} from '@contexts/AuthContext';
import {useGetCities} from '@services/city.service';
import {EnumUtils} from '@utils/enumUtils';
import {Interest, RidingStyle} from '@motorove/shared/enums';
import {launchImageLibrary} from 'react-native-image-picker';
// import {useUpdateUser} from '@services/user.service';

export const AccountSetupScreen = () => {
  const {height} = useWindowDimensions();
  const navigation = useNavigation<AuthScreenNavigationProp<'AccountSetup'>>();
  const {user} = useAuth();
  const insets = useSafeAreaInsets();
  const wizardRef = useRef<WizardHandle>(null);
  const {t, language} = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [isLastStep, setIsLastStep] = useState(false);
  const [selectedCity, setSelectedCity] = useState<DropdownItem | null>(null);
  const [selectedGender, setSelectedGender] = useState<DropdownItem | null>(
    null,
  );
  const [dateOfBirthValue, setDateOfBirthValue] = useState<Date>(
    new Date(new Date().getFullYear() - 20, 0, 1),
  );
  const [selectedRidingStyles, setSelectedRidingStyles] = useState<
    MultiSelectItem[]
  >([]);
  const [selectedInterests, setSelectedInterests] = useState<MultiSelectItem[]>(
    [],
  );
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    base64?: string | null;
  } | null>(null);
  const [showNotificationActivateButton, setShowNotificationActivateButton] =
    useState(true);
  // Add notification permission state
  const [notificationPermissionGranted, setNotificationPermissionGranted] =
    useState<boolean | null>(null);
  const [requestingPermission, setRequestingPermission] = useState(false);

  // Fetch cities from backend
  const {cities, loading: loadingCities} = useGetCities();
  // Use the updateUser hook
  // const {updateUser, loading} = useUpdateUser();

  // Transform cities into dropdown items
  const cityDropdownItems = useMemo(() => {
    return cities?.map(city => ({
      label: city.value || '',
      value: city.id || '',
      id: city.id || '',
    })) as DropdownItem[];
  }, [cities]);

  // Create validation schema with translations
  const {accountSetupSchema} = createAuthSchemas(t);

  const methods = useForm<AccountSetupFormValues>({
    resolver: zodResolver(accountSetupSchema),
    defaultValues: {
      dateOfBirth: null,
      gender: null,
      city: '',
      ridingStyles: [],
      interests: [],
      avatar: null,
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    control,
    formState: {errors},
    trigger,
    setValue,
    watch,
  } = methods;

  const dateOfBirth = watch('dateOfBirth');

  // Handle city selection
  const handleCitySelect = (item: DropdownItem | null) => {
    setSelectedCity(item);
    setValue('city', item?.value || '', {shouldValidate: true});
  };

  // Handle gender selection
  const handleGenderSelect = (item: DropdownItem | null) => {
    setSelectedGender(item);
    setValue('gender', item?.value, {shouldValidate: true});
  };

  // Handle riding styles selection
  const handleRidingStylesChange = (items: MultiSelectItem[]) => {
    setSelectedRidingStyles(items);
    setValue(
      'ridingStyles',
      items.map(x => x.value as RidingStyle),
      {
        shouldValidate: true,
      },
    );
  };

  // Handle interests selection
  const handleInterestsChange = (items: MultiSelectItem[]) => {
    setSelectedInterests(items);
    setValue(
      'interests',
      items.map(x => x.value as Interest),
      {
        shouldValidate: true,
      },
    );
  };

  // Handle avatar selection
  const handleSelectAvatar = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
        includeBase64: true,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // Check file size - 5MB limit
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          showToast({
            type: 'error',
            text1: t('common.error'),
            text2: t('screens.accountSetup.image_too_large'),
          });
          return;
        }

        const newImage = {
          uri: asset.uri || '',
          base64: asset.base64
            ? `data:image/jpeg;base64,${asset.base64}`
            : null,
        };

        setSelectedImage(newImage);
        setValue('avatar', newImage.base64 || newImage.uri, {
          shouldValidate: true,
        });
      }
    } catch (error) {
      loggingService.error('Error selecting avatar:', error);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.accountSetup.failed_to_select_image'),
      });
    }
  };

  // Initialize notification service on mount
  useEffect(() => {
    const initNotificationService = async () => {
      try {
        // Since we don't have direct access to the NotificationService class,
        // we'll create a function that wraps the initialization logic

        // First, check if Firebase is already initialized
        const firebase = await import('@react-native-firebase/app');
        const messaging = await import('@react-native-firebase/messaging');
        const config = await import('@configs');

        if (!firebase.default.apps.length) {
          // Initialize Firebase with configuration
          await firebase.default.initializeApp(config.getFirebaseConfig());
        }

        // Setup notification handling
        messaging
          .default()
          .setBackgroundMessageHandler(async () => Promise.resolve());
        messaging.default().onMessage(async remoteMessage => {
          showToast({
            type: 'info',
            text1: remoteMessage.notification?.title,
            text2: remoteMessage.notification?.body,
          });
          return Promise.resolve();
        });
      } catch (error) {
        loggingService.error(
          'Failed to initialize notification service:',
          error,
        );
      }
    };

    initNotificationService();
  }, []);

  // Handle notification permission request
  const handleRequestNotificationPermission = async () => {
    try {
      setRequestingPermission(true);

      // Import the required modules
      const {PermissionsAndroid, Platform} = require('react-native');
      const messaging = await import('@react-native-firebase/messaging');
      const AsyncStorage = await import(
        '@react-native-async-storage/async-storage'
      );

      // Request notification permissions
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }

      const authStatus = await messaging.default().requestPermission();
      const granted =
        authStatus === messaging.default.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.default.AuthorizationStatus.PROVISIONAL;

      setNotificationPermissionGranted(granted);

      if (granted) {
        // Get device token and store it
        await messaging.default().registerDeviceForRemoteMessages();
        const token = await messaging.default().getToken();
        if (token) {
          await AsyncStorage.default.setItem('fcm_token', token);
        }

        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.accountSetup.notification_permission_granted'),
        });
      } else {
        setShowNotificationActivateButton(false);
        showToast({
          type: 'info',
          text1: t('common.info'),
          text2: t('screens.accountSetup.notification_permission_denied'),
        });
      }
    } catch (error) {
      loggingService.error('Error requesting notification permission:', error);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.accountSetup.notification_permission_error'),
      });
    } finally {
      setRequestingPermission(false);
    }
  };

  const onSubmit = useCallback(
    async (data: AccountSetupFormValues) => {
      try {
        // Update user profile in the backend
        // await updateUser({
        //   dateOfBirth: data.dateOfBirth?.toLocaleDateString(),
        //   gender: data.gender,
        //   cityId: data.city,
        //   ridingStyles: data.ridingStyles,
        //   interests: data.interests,
        //   avatar: data.avatar,
        //   hasCompletedSetup: true,
        // });
        // // Navigate to the main app
        // navigation.reset({
        //   index: 0,
        //   routes: [{name: 'Main' as any}],
        // });
      } catch (error) {
        loggingService.error('Error submitting form:', error);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2: t('screens.accountSetup.setup_failed'),
        });
      }
    },
    // [navigation, t, updateUser],
    [navigation, t],
  );

  // Navigation handlers
  const handleNextStep = useCallback(() => {
    wizardRef.current?.nextStep();
  }, []);

  const handlePreviousStep = useCallback(() => {
    wizardRef.current?.previousStep();
  }, []);

  const handleStepChange = useCallback((index: number) => {
    setCurrentStepIndex(index);
  }, []);

  const handleWizardComplete = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  // Define wizard steps
  const wizardSteps = useMemo<WizardStep[]>(
    () => [
      {
        id: 'basic-info',
        title: t('screens.accountSetup.basic_information'),
        validate: async () => {
          const result = await trigger(['city', 'dateOfBirth']);
          return result;
        },
        content: (
          <View style={styles.fieldsContainer}>
            <Dropdown
              label={t('screens.accountSetup.city')}
              data={cityDropdownItems}
              loading={loadingCities}
              selectedItem={selectedCity}
              onSelect={handleCitySelect}
              error={errors.city?.message}
              showClearButton={false}
              testID="city-dropdown"
            />
            <DateTimePicker
              control={control}
              name="dateOfBirth"
              placeholder={t('screens.accountSetup.date_of_birth')}
              cancelText={t('common.cancel')}
              confirmText={t('common.confirm')}
              minimumDate={new Date(new Date().getFullYear() - 80, 0, 1)}
              maximumDate={new Date(new Date().getFullYear() - 13, 0, 1)}
              defaultValue={dateOfBirthValue}
              error={errors.dateOfBirth}
              testID="date-of-birth-picker"
              locale={language}
              displayFormat="long"
              mode="date"
            />
            <Dropdown
              label={t('screens.accountSetup.gender')}
              data={EnumUtils.getGenderDropdownOptions()}
              selectedItem={selectedGender}
              onSelect={handleGenderSelect}
              error={errors.gender?.message}
              showClearButton={false}
              testID="gender-dropdown"
            />
          </View>
        ),
      },
      {
        id: 'riding-preferences',
        title: t('screens.accountSetup.riding_preferences_and_interests'),
        optional: true,
        content: (
          <View style={styles.fieldsContainer}>
            <MultiSelect
              label={t('screens.accountSetup.riding_styles')}
              data={EnumUtils.getRidingStyleDropdownOptions()}
              selectedItems={selectedRidingStyles}
              onSelectionChange={handleRidingStylesChange}
              testID="riding-styles-multiselect"
            />
            <MultiSelect
              label={t('screens.accountSetup.interests')}
              data={EnumUtils.getInterestDropdownOptions()}
              selectedItems={selectedInterests}
              onSelectionChange={handleInterestsChange}
              testID="interests-multiselect"
            />
          </View>
        ),
      },
      {
        id: 'avatar',
        title: t('screens.accountSetup.avatar'),
        optional: true,
        content: (
          <View style={styles.avatarSectionContainer}>
            <View style={styles.avatarContainer}>
              {selectedImage ? (
                <Image
                  source={{uri: selectedImage.uri}}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Icon
                    name="user-filled"
                    size={64}
                    color={colors.neutral.white}
                  />
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={handleSelectAvatar}
              activeOpacity={0.8}
              style={styles.uploadPhotoButton}
              testID="select-avatar-button">
              <Icon
                name="camera-filled"
                size={18}
                color={colors.neutral.black}
              />
              <BodySmall style={styles.uploadPhotoText}>
                {t('screens.accountSetup.upload_photo')}
              </BodySmall>
            </TouchableOpacity>
          </View>
        ),
      },
      {
        id: 'notification-permission',
        title: t('screens.accountSetup.notifications'),
        optional: true,
        content: (
          <ScrollView>
            <View style={styles.notificationSectionContainer}>
              <View style={styles.bellIconContainer}>
                <Icon
                  name="bell-filled"
                  size={24}
                  color={colors.primary.main}
                />
              </View>

              <Title style={styles.notificationTitle}>
                {t('screens.accountSetup.stay_connected')}
              </Title>

              <Body style={styles.notificationDescription}>
                {t('screens.accountSetup.notification_description')}
              </Body>

              <View style={styles.notificationFeatures}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <Icon
                      name="bell-exclamation-filled"
                      size={24}
                      color={colors.neutral.white}
                    />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <BodySmall style={styles.featureTitle}>
                      {t(
                        'screens.accountSetup.notification_feature_events_title',
                      )}
                    </BodySmall>
                    <BodySmall style={styles.featureText}>
                      {t('screens.accountSetup.notification_feature_events')}
                    </BodySmall>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <Icon
                      name="comments-filled"
                      size={24}
                      color={colors.neutral.white}
                    />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <BodySmall style={styles.featureTitle}>
                      {t(
                        'screens.accountSetup.notification_feature_comments_title',
                      )}
                    </BodySmall>
                    <BodySmall style={styles.featureText}>
                      {t('screens.accountSetup.notification_feature_comments')}
                    </BodySmall>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <Icon
                      name="users-filled"
                      size={24}
                      color={colors.neutral.white}
                    />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <BodySmall style={styles.featureTitle}>
                      {t(
                        'screens.accountSetup.notification_feature_groups_title',
                      )}
                    </BodySmall>
                    <BodySmall style={styles.featureText}>
                      {t('screens.accountSetup.notification_feature_groups')}
                    </BodySmall>
                  </View>
                </View>
              </View>

              {/* Status indicator */}
              {notificationPermissionGranted && (
                <View style={styles.statusContainer}>
                  <Icon
                    name="check-filled"
                    size={24}
                    color={colors.status.success}
                  />
                  <BodySmall style={styles.statusText}>
                    {t('screens.accountSetup.permissions_granted')}
                  </BodySmall>
                </View>
              )}
              {!showNotificationActivateButton && (
                <Button
                  title={
                    notificationPermissionGranted
                      ? t('screens.accountSetup.notifications_enabled')
                      : t('screens.accountSetup.enable_notifications')
                  }
                  variant={
                    notificationPermissionGranted ? 'secondary' : 'primary'
                  }
                  shape="round"
                  onPress={handleRequestNotificationPermission}
                  loading={requestingPermission}
                  disabled={notificationPermissionGranted === true}
                  style={styles.notificationButton}
                  testID="notification-permission-button"
                />
              )}
            </View>
          </ScrollView>
        ),
      },
    ],
    [
      trigger,
      control,
      errors.city,
      errors.dateOfBirth,
      errors.gender,
      cityDropdownItems,
      loadingCities,
      t,
      handleCitySelect,
      handleGenderSelect,
      selectedCity,
      selectedGender,
      selectedRidingStyles,
      handleRidingStylesChange,
      selectedInterests,
      handleInterestsChange,
      selectedImage,
      notificationPermissionGranted,
      requestingPermission,
      handleRequestNotificationPermission,
    ],
  );

  // Update step status when wizard step changes
  useEffect(() => {
    setIsFirstStep(currentStepIndex === 0);
    setIsLastStep(currentStepIndex === wizardSteps.length - 1);
  }, [currentStepIndex, wizardSteps.length]);

  useEffect(() => {
    if (dateOfBirth) {
      setDateOfBirthValue(dateOfBirth);
    }
  }, [dateOfBirth]);

  return (
    <View style={styles.container}>
      <TopHeaderBar showBackButton={false} showShadow={false} />
      <SafeAreaView style={[styles.container, {paddingBottom: insets.bottom}]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}>
          <View style={[styles.content, {minHeight: height * 0.8}]}>
            <Title>
              {user?.firstName
                ? `${t('screens.accountSetup.hi')} ${user?.firstName}!`
                : ''}
            </Title>
            <BodySmall style={styles.welcomeText}>
              {t('screens.accountSetup.let_us_complete_your_profile')}
            </BodySmall>
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
                      title={t('common.back')}
                      variant="outline"
                      shape="round"
                      onPress={handlePreviousStep}
                      style={styles.backButton}
                      testID="back-button"
                    />
                    <Button
                      title={
                        loading ? t('common.completing') : t('common.complete')
                      }
                      variant="primary"
                      shape="round"
                      onPress={handleSubmit(onSubmit)}
                      loading={loading}
                      style={styles.continueButton}
                      testID="complete-setup-button"
                    />
                  </>
                ) : isFirstStep ? (
                  <Button
                    title={t('common.next')}
                    variant="dark"
                    shape="round"
                    onPress={handleNextStep}
                    style={styles.continueButton}
                    testID="continue-button"
                  />
                ) : (
                  <>
                    <Button
                      title={t('common.back')}
                      variant="outline"
                      shape="round"
                      onPress={handlePreviousStep}
                      style={styles.backButton}
                      testID="back-button"
                    />
                    <Button
                      title={t('common.next')}
                      variant="dark"
                      shape="round"
                      onPress={handleNextStep}
                      style={styles.continueButton}
                      testID="continue-button"
                    />
                  </>
                )}
              </View>
            </FormProvider>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  welcomeText: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  wizardContainer: {
    flex: 1,
    width: '100%',
  },
  stepContent: {
    flex: 1,
    width: '100%',
    paddingVertical: spacing.md,
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
  backButton: {
    flex: 1,
  },
  continueButton: {
    flex: 1,
  },
  emptyStepContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyStepText: {
    fontSize: 18,
    color: colors.neutral.grey,
    textAlign: 'center',
  },
  fieldsContainer: {
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.neutral.black,
    marginBottom: spacing.xs,
  },
  // Avatar styles
  avatarSectionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  avatarContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: spacing.md,
    ...getShadow('small'),
  },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.neutral.black,
  },
  avatarPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.neutral.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPhotoButton: {
    position: 'absolute',
    top: 180,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    gap: spacing.sm,
    ...getShadow('medium'),
  },
  uploadPhotoText: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.neutral.black,
  },
  // Notification permission styles
  notificationSectionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  bellIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...getShadow('medium'),
  },
  notificationTitle: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.neutral.darkGrey,
  },
  notificationDescription: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    maxWidth: '90%',
    color: colors.neutral.grey,
  },
  notificationFeatures: {
    width: '100%',
    gap: spacing.lg,
    marginVertical: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.secondary.light,
    borderRadius: radius.md,
    ...getShadow('small'),
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: '600',
    color: colors.neutral.darkGrey,
    marginBottom: spacing.xs / 2,
  },
  featureText: {
    color: colors.neutral.grey,
    flex: 1,
  },
  notificationButton: {
    marginTop: spacing.lg,
    width: '100%',
    ...getShadow('small'),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.status.success + '20', // 20% opacity
    borderRadius: radius.md,
  },
  statusText: {
    color: colors.status.success,
    fontWeight: '500',
  },
});
