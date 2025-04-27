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
  Chip,
} from '@components';
import SearchableDropdown, {DropdownItem} from '@components/SearchableDropdown';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  accountSetupSchema,
  AccountSetupFormValues,
} from '@utils/validation/authValidation';
import {colors, fontSizes, spacing} from '@theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// User type options for dropdown
const userTypeOptions: DropdownItem[] = [
  {id: '1', label: 'Rider', value: 'rider'},
  {id: '2', label: 'Mechanic', value: 'mechanic'},
  {id: '3', label: 'Enthusiast', value: 'enthusiast'},
  {id: '4', label: 'Professional', value: 'professional'},
  {id: '5', label: 'Beginner', value: 'beginner'},
  {id: '6', label: 'Other', value: 'other'},
  {id: '7', label: 'Admin', value: 'admin'},
  {id: '8', label: 'Moderator', value: 'moderator'},
  {id: '9', label: 'Support', value: 'support'},
  {id: '10', label: 'Developer', value: 'developer'},
  {id: '11', label: 'Designer', value: 'designer'},
  {id: '12', label: 'Writer', value: 'writer'},
  {id: '13', label: 'Editor', value: 'editor'},
];

// User interests options for chips
const interestOptions = [
  {id: '1', label: 'Sport Bikes'},
  {id: '2', label: 'Cruisers'},
  {id: '3', label: 'Adventure'},
  {id: '4', label: 'Touring'},
  {id: '5', label: 'Off-Road'},
  {id: '6', label: 'Vintage'},
  {id: '7', label: 'Racing'},
  {id: '8', label: 'Stunts'},
  {id: '9', label: 'Customization'},
  {id: '10', label: 'Maintenance'},
  {id: '11', label: 'Community'},
  {id: '12', label: 'Events'},
];

export function AccountSetupScreen() {
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<DropdownItem | null>(
    null,
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
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
    trigger,
  } = useForm<AccountSetupFormValues>({
    resolver: zodResolver(accountSetupSchema),
    defaultValues: {
      username: 'berkanbugday',
      bio: '',
      phoneNumber: '',
      profilePhotoUrl: '',
      userType: '',
      interests: [],
    },
    mode: 'onChange',
  });

  // Handle user type selection
  const handleUserTypeSelect = (item: DropdownItem) => {
    setSelectedUserType(item);
    setValue('userType', item.value || '', {shouldValidate: true});
  };

  // Handle interest selection
  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prevInterests => {
      const newInterests = prevInterests.includes(interestId)
        ? prevInterests.filter(id => id !== interestId)
        : [...prevInterests, interestId];

      // Update the form value
      setValue('interests', newInterests, {shouldValidate: true});
      return newInterests;
    });
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
      console.log('Selected user type:', data.userType);
      console.log('Selected interests:', data.interests);

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

  // Define wizard steps
  const basicInfoStep: WizardStep = {
    id: 'basic-info',
    title: 'Basic Information',
    validate: async () => {
      // Validate username, userType, and interests fields
      const result = await trigger(['username', 'userType']);
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

        <View style={styles.dropdownContainer}>
          <SearchableDropdown
            data={userTypeOptions}
            label="User Type"
            selectedItem={selectedUserType}
            onSelect={handleUserTypeSelect}
            error={errors.userType?.message}
            testID="user-type-dropdown"
          />
        </View>

        <View>
          <Text style={styles.interestsLabel}>Select Your Interests</Text>
          <View style={styles.chipsContainer}>
            {interestOptions.map(interest => (
              <Chip
                key={interest.id}
                label={interest.label}
                variant={
                  selectedInterests.includes(interest.id)
                    ? 'filled'
                    : 'outlined'
                }
                color="dark"
                selected={selectedInterests.includes(interest.id)}
                onPress={() => handleInterestToggle(interest.id)}
                testID={`interest-chip-${interest.id}`}
              />
            ))}
          </View>
        </View>

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
      const result = await trigger(['phoneNumber']);
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
            textStyle={{fontSize: fontSizes.sm}}
            testID="complete-setup-button"
          />
        </View>
      </View>
    ),
  };

  const wizardSteps = [basicInfoStep, contactInfoStep, profilePhotoStep];

  return (
    <SafeAreaView style={[styles.container, {paddingTop: insets.top}]}>
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
    gap: spacing.lg,
  },
  dropdownContainer: {
    width: '100%',
  },
  photoContainer: {
    alignItems: 'center',
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
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  continueButton: {
    flex: 1,
  },
  interestsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral.darkGrey,
    marginBottom: spacing.sm,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
