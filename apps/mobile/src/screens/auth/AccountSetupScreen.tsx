import React, {useState, useRef, useCallback, useMemo} from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  useWindowDimensions,
  Alert,
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
} from '@components';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  createAuthSchemas,
  AccountSetupFormValues,
} from '@utils/validation/authValidation';
import {colors, fontSizes, spacing} from '@theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {loggingService} from '@services/logging.service';
import {useTranslation} from '@hooks/useTranslation';
import {useAuth} from '@contexts/AuthContext';
import {useGetCities} from '@services/city.service';
import {EnumUtils} from '@utils/enumUtils';

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
      dateOfBirth: new Date(1990, 1, 1),
      gender: undefined,
      city: '',
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

  const onSubmit = useCallback(
    async (data: AccountSetupFormValues) => {
      try {
        setLoading(true);
        // In a real app, you would submit this data to your API
        loggingService.info('Form data submitted:', {
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          city: data.city,
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
              testID="city-dropdown"
            />
            <DateTimePicker
              control={control}
              name="dateOfBirth"
              placeholder={t('screens.accountSetup.date_of_birth')}
              maximumDate={new Date()}
              error={errors.dateOfBirth}
              testID="date-of-birth-picker"
              locale={language}
            />
            <Dropdown
              label={t('screens.accountSetup.gender')}
              data={EnumUtils.getGenderDropdownOptions()}
              selectedItem={selectedGender}
              onSelect={handleGenderSelect}
              error={errors.gender?.message}
              searchable={false}
              testID="gender-dropdown"
            />
          </View>
        ),
      },
      {
        id: 'contact-info',
        title: 'Contact Information',
        validate: async () => {
          return true; // No fields to validate in this step anymore
        },
        optional: true,
        content: (
          <ScrollView style={styles.stepContent}>
            <View style={styles.emptyStepContent}>
              <Text style={styles.emptyStepText}>
                Please proceed to the next step
              </Text>
            </View>
          </ScrollView>
        ),
      },
      {
        id: 'profile-photo',
        title: 'Profile Photo',
        optional: true,
        validate: async () => {
          const result = await trigger(['dateOfBirth', 'gender']);
          return result;
        },
        content: (
          <ScrollView style={styles.stepContent}>
            {/* Profile photo fields have been removed */}
            <View style={styles.emptyStepContent}>
              <Text style={styles.emptyStepText}>
                Please proceed to the next step
              </Text>
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
    ],
  );

  // Update step status when wizard step changes
  React.useEffect(() => {
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
                      textStyle={{fontSize: fontSizes.sm}}
                      testID="complete-setup-button"
                    />
                  </>
                ) : isFirstStep ? (
                  <Button
                    title={t('common.next')}
                    variant="primary"
                    shape="round"
                    onPress={handleNextStep}
                    style={{flex: 1}}
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
                      variant="primary"
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
    gap: spacing.lg,
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
});
