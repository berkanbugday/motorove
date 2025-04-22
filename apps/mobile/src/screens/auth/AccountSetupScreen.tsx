import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  AuthScreenNavigationProp,
  AuthScreenRouteProp,
} from '@navigation/types/navigationTypes';
import {
  Icon,
  AnimatedInput,
  Button,
  Wizard,
  WizardHandle,
  WizardStep,
  Title,
} from '@components';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  accountSetupSchema,
  AccountSetupFormValues,
} from '@utils/validation/authValidation';
import {colors, spacing, radius} from '@theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export function AccountSetupScreen() {
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const {height} = useWindowDimensions();
  const navigation = useNavigation<AuthScreenNavigationProp<'AccountSetup'>>();
  const route = useRoute<AuthScreenRouteProp<'AccountSetup'>>();
  const {fullName} = route.params || {};
  const insets = useSafeAreaInsets();
  const wizardRef = useRef<WizardHandle>(null);

  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
    watch,
    trigger,
  } = useForm<AccountSetupFormValues>({
    resolver: zodResolver(accountSetupSchema),
    defaultValues: {
      username: '',
      bio: '',
      phoneNumber: '',
      birthDate: undefined,
      profilePhotoUrl: '',
    },
    mode: 'onChange',
  });

  const birthDateValue = watch('birthDate');

  const handleDateChange = () => {
    // In a real implementation, this would use DateTimePicker
    // For now, we'll just simulate selecting today's date
    const today = new Date();
    setShowDatePicker(false);
    setValue('birthDate', today, {shouldValidate: true});
  };

  const handleChoosePhoto = () => {
    // This would normally integrate with the device camera/photo library
    // For this example, we'll just show a placeholder
    Alert.alert('Upload Photo', 'This would open the camera or photo library', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Use Placeholder',
        onPress: () => {
          // In a real app, this would be a URL to an uploaded image
          setSelectedImage('https://via.placeholder.com/150');
          setValue('profilePhotoUrl', 'https://via.placeholder.com/150', {
            shouldValidate: true,
          });
        },
      },
    ]);
  };

  const onSubmit = async (data: AccountSetupFormValues) => {
    try {
      setLoading(true);
      // In a real app, you would submit this data to your API
      console.log('Form data submitted:', data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate to the main app
      navigation.reset({
        index: 0,
        routes: [{name: 'Main' as any}],
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert(
        'Error',
        'There was a problem setting up your account. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${
      months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Define wizard steps
  const basicInfoStep: WizardStep = {
    id: 'basic-info',
    title: 'Basic Information',
    validate: async () => {
      // Validate username field
      const result = await trigger('username');
      return result;
    },
    content: (
      <View style={styles.stepContent}>
        <AnimatedInput
          control={control}
          name="username"
          label="Username"
          icon={<Icon name="user" size={20} />}
          error={errors.username}
          testID="setup-username"
        />
        <AnimatedInput
          control={control}
          name="bio"
          label="Bio (Optional)"
          icon={<Icon name="user" size={20} />}
          error={errors.bio}
          testID="setup-bio"
        />
        <Button
          title="Continue"
          variant="primary"
          shape="round"
          onPress={() => wizardRef.current?.nextStep()}
          style={styles.button}
          testID="continue-button"
        />
      </View>
    ),
  };

  const contactInfoStep: WizardStep = {
    id: 'contact-info',
    title: 'Contact Information',
    validate: async () => {
      // Since the contact info fields are optional, we'll always return true
      // But if we had required fields here, we would validate them
      const result = await trigger(['phoneNumber', 'birthDate']);
      return result;
    },
    optional: true,
    content: (
      <View style={styles.stepContent}>
        <AnimatedInput
          control={control}
          name="phoneNumber"
          label="Phone Number (Optional)"
          icon={<Icon name="envelope" size={20} />}
          keyboardType="phone-pad"
          error={errors.phoneNumber}
          testID="setup-phone"
        />

        {/* Birth Date Selector */}
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}>
          <Text style={styles.datePickerLabel}>Birth Date (Optional)</Text>
          <Text style={styles.datePickerValue}>
            {birthDateValue ? formatDate(birthDateValue) : 'Select date'}
          </Text>
          <Icon name="user" size={20} color={colors.neutral.grey} />
        </TouchableOpacity>
        {errors.birthDate && (
          <Text style={styles.errorText}>
            {errors.birthDate.message?.toString()}
          </Text>
        )}

        {showDatePicker && (
          // This would be a DateTimePicker in a real implementation
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerContent}>
              <Text style={styles.datePickerTitle}>Select Birth Date</Text>
              <Button
                title="Select Today (Demo)"
                variant="primary"
                onPress={handleDateChange}
                testID="select-date-button"
              />
              <Button
                title="Cancel"
                variant="text"
                onPress={() => setShowDatePicker(false)}
                testID="cancel-date-button"
              />
            </View>
          </View>
        )}

        <View style={styles.navigationButtons}>
          <Button
            title="Back"
            variant="outline"
            shape="round"
            onPress={() => wizardRef.current?.previousStep()}
            style={styles.backButton}
            testID="back-button"
          />
          <Button
            title="Continue"
            variant="primary"
            shape="round"
            onPress={() => wizardRef.current?.nextStep()}
            style={styles.continueButton}
            testID="continue-button"
          />
        </View>
      </View>
    ),
  };

  const profilePhotoStep: WizardStep = {
    id: 'profile-photo',
    title: 'Profile Photo',
    optional: true,
    validate: async () => {
      // Profile photo is optional, but we'll validate to ensure
      // it meets requirements if one is provided
      const result = await trigger('profilePhotoUrl');
      return result;
    },
    content: (
      <View style={styles.stepContent}>
        <View style={styles.photoContainer}>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={handleChoosePhoto}>
            {selectedImage ? (
              <Image
                source={{uri: selectedImage}}
                style={styles.profilePhoto}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Icon name="user" size={50} color={colors.neutral.grey} />
              </View>
            )}
            <View style={styles.photoEditBadge}>
              <Icon name="user" size={16} color={colors.neutral.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHelpText}>Add profile photo</Text>
        </View>

        <View style={styles.navigationButtons}>
          <Button
            title="Back"
            variant="outline"
            shape="round"
            onPress={() => wizardRef.current?.previousStep()}
            style={styles.backButton}
            testID="back-button"
          />
          <Button
            title={loading ? 'Completing...' : 'Complete Setup'}
            variant="primary"
            shape="round"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.continueButton}
            testID="complete-setup-button"
          />
        </View>

        <Button
          title="Skip for now"
          variant="text"
          shape="round"
          onPress={() => {
            // Skip profile setup and go to main app
            navigation.reset({
              index: 0,
              routes: [{name: 'Main' as any}],
            });
          }}
          style={styles.skipButton}
          testID="skip-setup-button"
        />
      </View>
    ),
  };

  const wizardSteps = [basicInfoStep, contactInfoStep, profilePhotoStep];

  return (
    <SafeAreaView style={[styles.container, {paddingTop: insets.top}]}>
      {/* <Header
        title="Complete Your Profile"
        showBackButton
        onBackPress={() => navigation.goBack()}
      /> */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={[styles.content, {minHeight: height * 0.8}]}>
            <Title align="center" style={styles.welcomeText}>
              {fullName ? `Hi ${fullName.split(' ')[0]}!` : 'Almost there!'}{' '}
              Let's complete your profile
            </Title>

            <Wizard
              ref={wizardRef}
              steps={wizardSteps}
              onComplete={() => {
                handleSubmit(onSubmit)();
              }}
              progressIndicatorType="line"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    padding: spacing.lg,
    alignItems: 'center',
  },
  welcomeText: {
    marginBottom: spacing.xl,
  },
  stepContent: {
    width: '100%',
    gap: spacing.md,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  photoButton: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'visible',
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.neutral.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.grey,
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary.main,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.neutral.white,
  },
  photoHelpText: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.neutral.grey,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.neutral.lightGrey,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    height: 56,
  },
  datePickerLabel: {
    fontSize: 14,
    color: colors.neutral.grey,
    position: 'absolute',
    top: 5,
    left: spacing.md,
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 4,
  },
  datePickerValue: {
    fontSize: 16,
    color: colors.neutral.darkGrey,
    flex: 1,
    marginLeft: spacing.sm,
  },
  datePickerModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  datePickerContent: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '80%',
    alignItems: 'center',
    gap: spacing.md,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.status.error,
    fontSize: 12,
    marginLeft: spacing.sm,
    marginTop: -spacing.sm,
  },
  button: {
    marginTop: spacing.lg,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  backButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  continueButton: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  skipButton: {
    marginTop: spacing.sm,
  },
});
