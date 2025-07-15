import React, {useState, useRef, useCallback, useMemo, useEffect} from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  useWindowDimensions,
  Alert,
  Image,
  TouchableOpacity,
  Text,
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

export const AccountSetupScreen = () => {
  const [loading, setLoading] = useState(false);
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
  const [selectedRidingStyles, setSelectedRidingStyles] = useState<
    MultiSelectItem[]
  >([]);
  const [selectedInterests, setSelectedInterests] = useState<MultiSelectItem[]>(
    [],
  );
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    base64?: string;
  } | null>(null);
  // Fetch cities from backend
  const {cities, loading: loadingCities} = useGetCities();

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
      profilePhoto: undefined,
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    control,
    formState: {errors},
    trigger,
    setValue,
  } = methods;

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

  // Handle profile photo selection
  const handleSelectProfilePhoto = async () => {
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
            : undefined,
        };

        setSelectedImage(newImage);
        setValue('profilePhoto', newImage.base64 || newImage.uri, {
          shouldValidate: true,
        });
      }
    } catch (error) {
      loggingService.error('Error selecting profile photo:', error);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.accountSetup.failed_to_select_image'),
      });
    }
  };

  const onSubmit = useCallback(
    async (data: AccountSetupFormValues) => {
      try {
        setLoading(true);
        // In a real app, you would submit this data to your API
        loggingService.info('Form data submitted:', {
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          city: data.city,
          ridingStyles: data.ridingStyles,
          interests: data.interests,
          profilePhoto: data.profilePhoto ? '(Photo data included)' : undefined,
        });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Navigate to the main app
        navigation.reset({
          index: 0,
          routes: [{name: 'Main' as any}],
        });
      } catch (error) {
        loggingService.error('Error submitting form:', error);
        Alert.alert(
          'Error',
          'There was a problem setting up your account. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    },
    [navigation],
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
          const result = await trigger(['city', 'dateOfBirth', 'gender']);
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
              searchable={true}
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
              defaultValue={new Date(new Date().getFullYear() - 20, 0, 1)}
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
              searchable={false}
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
              searchable={false}
              testID="riding-styles-multiselect"
            />
            <MultiSelect
              label={t('screens.accountSetup.interests')}
              data={EnumUtils.getInterestDropdownOptions()}
              selectedItems={selectedInterests}
              onSelectionChange={handleInterestsChange}
              searchable={false}
              testID="interests-multiselect"
            />
          </View>
        ),
      },
      {
        id: 'profile-photo',
        title: t('screens.accountSetup.profile_photo'),
        optional: true,
        content: (
          <View style={styles.profilePhotoContainer}>
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
              onPress={handleSelectProfilePhoto}
              activeOpacity={0.8}
              style={styles.uploadPhotoButton}
              testID="select-profile-photo-button">
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
    ],
  );

  // Update step status when wizard step changes
  useEffect(() => {
    setIsFirstStep(currentStepIndex === 0);
    setIsLastStep(currentStepIndex === wizardSteps.length - 1);
  }, [currentStepIndex, wizardSteps.length]);

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
  // Profile photo styles
  profilePhotoContainer: {
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
});
