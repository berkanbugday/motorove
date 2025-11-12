import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useNavigation} from '@react-navigation/native';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useAuth, useLanguage} from '@contexts';
import {colors, commonStyles, radius, spacing} from '@theme';
import {
  Icon,
  Button,
  TopHeaderBar,
  AnimatedInput,
  LoadingIndicator,
  MultiSelect,
  MultiSelectItem,
  Dropdown,
  DropdownItem,
  DateTimePicker,
  Subtitle,
  showToast,
} from '@components';
import {
  Gender,
  RidingStyle,
  Interest,
  SocialMediaPlatform,
  IUserSocialMediaProfile,
} from '@motorove/shared';
import {useGetUserProfile, useUpdateUserProfile} from '@services/user.service';
import {useTranslation} from '@hooks/useTranslation';
import {EnumUtils} from '@utils/enumUtils';
import {launchImageLibrary} from 'react-native-image-picker';
import {loggingService} from '@services/logging.service';
import {
  profileSchemas,
  UpdateProfileFormValues,
} from '@utils/validation/profileValidation';
import {
  getSocialMediaPrefix,
  getSocialMediaIcon,
} from '@utils/socialMediaUtils';

/**
 * Edit Profile Screen - Allows users to edit their profile information
 */
export const EditProfileScreen = () => {
  const {user} = useAuth();
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {language} = useLanguage();
  const formInitialized = useRef(false);

  // Form state
  const [selectedRidingStyles, setSelectedRidingStyles] = useState<
    MultiSelectItem[]
  >([]);
  const [selectedInterests, setSelectedInterests] = useState<MultiSelectItem[]>(
    [],
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [userSocialMediaProfiles, setUserSocialMediaProfiles] = useState<
    IUserSocialMediaProfile[]
  >([]);
  const [selectedGender, setSelectedGender] = useState<DropdownItem | null>(
    null,
  );

  // Fetch user profile
  const {profile, loading: profileLoading} = useGetUserProfile(user?.id!);

  // Mutations
  const {updateUserProfile, loading: updateLoading} = useUpdateUserProfile(
    () => {
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    },
  );

  const {updateProfileSchema} = profileSchemas(t);

  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
    watch,
    reset,
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      bio: '',
      gender: null,
      dateOfBirth: null,
      ridingStyles: [],
      interests: [],
      avatar: null,
      socialMediaProfiles: [],
    },
    mode: 'onChange',
  });

  const dateOfBirth = watch('dateOfBirth');
  // Initialize form with user data
  useEffect(() => {
    if (profileLoading || !profile || formInitialized.current) {
      return;
    }

    try {
      reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
        gender: profile.gender || null,
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
        ridingStyles: profile.ridingStyles || [],
        interests: profile.interests || [],
        avatar: profile.avatar || null,
        socialMediaProfiles: profile.socialMediaProfiles || [],
      });

      // Set avatar preview
      if (profile.avatar) {
        setAvatarPreview(profile.avatar);
      }

      // Convert riding styles to MultiSelectItems
      if (profile?.ridingStyles) {
        const ridingStyleItems =
          EnumUtils.getRidingStyleDropdownOptions().filter(item =>
            profile.ridingStyles?.includes(item.value as RidingStyle),
          );
        setSelectedRidingStyles(ridingStyleItems);
      }

      // Convert interests to MultiSelectItems
      if (profile?.interests) {
        const interestItems = EnumUtils.getInterestDropdownOptions().filter(
          item => profile.interests?.includes(item.value as Interest),
        );
        setSelectedInterests(interestItems);
      }

      if (profile?.interests) {
        const interestItems = EnumUtils.getInterestDropdownOptions().filter(
          item => profile.interests?.includes(item.value as Interest),
        );
        setSelectedInterests(interestItems);
      }

      if (profile.gender) {
        const genderItem = EnumUtils.getGenderDropdownOptions().find(
          item => profile.gender === item.value,
        );
        setSelectedGender(genderItem || null);
      }

      setUserSocialMediaProfiles(profile.socialMediaProfiles || []);

      formInitialized.current = true;
    } catch (error) {
      loggingService.error('Error populating form data:', error);
    }
  }, [profile, profileLoading, reset]);

  const handleImagePicker = async () => {
    try {
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
            text1: t('common.error'),
            text2: t('screens.editProfile.image_too_large'),
          });
          return;
        }

        // Set preview URI for display
        setAvatarPreview(asset.uri || '');

        // Set base64 data for upload
        setValue(
          'avatar',
          asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null,
          {
            shouldValidate: true,
          },
        );
      }
    } catch (error) {
      loggingService.error('Error selecting avatar:', error);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.editProfile.failed_to_select_image'),
      });
    }
  };

  // Handle riding styles selection
  const handleRidingStylesChange = (items: MultiSelectItem[]) => {
    setSelectedRidingStyles(items);
    setValue(
      'ridingStyles',
      items.map(x => x.value as RidingStyle),
      {shouldValidate: true},
    );
  };

  // Handle interests selection
  const handleInterestsChange = (items: MultiSelectItem[]) => {
    setSelectedInterests(items);
    setValue(
      'interests',
      items.map(x => x.value as Interest),
      {shouldValidate: true},
    );
  };

  const handleGenderSelect = (item: DropdownItem | null) => {
    setSelectedGender(item);
    setValue('gender', item?.value as Gender | null, {shouldValidate: true});
  };

  const handleAddSocialMedia = (platform: SocialMediaPlatform) => {
    const existing = userSocialMediaProfiles.find(
      sm => sm.platform === platform,
    );

    if (existing) {
      // Second click on active button - remove social media
      handleRemoveSocialMedia(platform);
    } else {
      // First click on inactive button - add social media
      setUserSocialMediaProfiles([
        ...userSocialMediaProfiles,
        {id: '', platform, username: ''},
      ]);
    }
  };

  const handleUpdateSocialMedia = (
    platform: SocialMediaPlatform,
    field: 'username',
    value: string,
  ) => {
    setUserSocialMediaProfiles(prev =>
      prev.map(sm => (sm.platform === platform ? {...sm, [field]: value} : sm)),
    );
  };

  const handleRemoveSocialMedia = async (platform: SocialMediaPlatform) => {
    setUserSocialMediaProfiles(prev =>
      prev.filter(s => s.platform !== platform),
    );
  };

  const onSubmit = async (data: UpdateProfileFormValues) => {
    try {
      // Strip __typename from socialMedia objects to prevent GraphQL validation error
      const cleanedSocialMediaProfiles = userSocialMediaProfiles.map(
        ({platform, username, id}) => ({
          ...(id && {id}),
          platform,
          username,
        }),
      );

      const input = {
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        gender: selectedGender?.value as Gender | null,
        dateOfBirth: data.dateOfBirth
          ? new Date(
              data.dateOfBirth.getFullYear(),
              data.dateOfBirth.getMonth(),
              data.dateOfBirth.getDate(),
              15,
              0,
            )
          : data.dateOfBirth,
        ridingStyles: data.ridingStyles || [],
        interests: data.interests || [],
        avatar: data.avatar,
        socialMediaProfiles: cleanedSocialMediaProfiles,
      };

      await updateUserProfile(input);
    } catch (error) {
      loggingService.error('Error in onSubmit:', error);
    }
  };

  if (profileLoading) {
    return (
      <View style={styles.container}>
        <TopHeaderBar
          title={t('screens.editProfile.title')}
          showBackButton
          showShadow={false}
          onBackPress={() => navigation.goBack()}
        />
        <LoadingIndicator visible={true} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.editProfile.title')}
        showBackButton
        showShadow={false}
        containerStyle={styles.topHeaderBar}
        onBackPress={() => navigation.goBack()}
      />
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          enableResetScrollToCoords={false}
          keyboardShouldPersistTaps="handled">
          {/* Avatar Section */}
          <View style={styles.section}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  avatarPreview
                    ? {uri: avatarPreview}
                    : require('@assets/images/default_avatar.png')
                }
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.changeAvatarButton}
                activeOpacity={0.8}
                onPress={handleImagePicker}>
                <Icon
                  name="camera-filled"
                  size={20}
                  color={colors.neutral.white}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Basic Info Section */}
          <View style={styles.section}>
            <Subtitle weight="bold" style={styles.sectionTitle}>
              {t('screens.editProfile.basic_info')}
            </Subtitle>
            <View style={styles.inputGroup}>
              <AnimatedInput
                control={control}
                name="firstName"
                label={t('screens.editProfile.first_name')}
                error={errors.firstName}
              />
            </View>

            <View style={styles.inputGroup}>
              <AnimatedInput
                control={control}
                name="lastName"
                label={t('screens.editProfile.last_name')}
                error={errors.lastName}
              />
            </View>

            <View style={styles.inputGroup}>
              <AnimatedInput
                control={control}
                name="bio"
                label={t('screens.editProfile.bio')}
                multiline
                error={errors.bio}
              />
            </View>

            <View style={styles.inputGroup}>
              <Dropdown
                label={t('screens.editProfile.gender')}
                data={EnumUtils.getGenderDropdownOptions()}
                selectedItem={selectedGender}
                onSelect={handleGenderSelect}
                error={errors.gender?.message}
                showClearButton={false}
                testID="gender-dropdown"
              />
            </View>

            <View style={styles.inputGroup}>
              <DateTimePicker
                control={control}
                name="dateOfBirth"
                defaultValue={dateOfBirth}
                placeholder={t('screens.editProfile.date_of_birth')}
                mode="date"
                minimumDate={
                  new Date(
                    new Date().getFullYear() - 85,
                    new Date().getMonth(),
                    new Date().getDate(),
                  )
                }
                maximumDate={
                  new Date(
                    new Date().getFullYear() - 15,
                    new Date().getMonth(),
                    new Date().getDate(),
                  )
                }
                locale={language}
                cancelText={t('common.cancel')}
                confirmText={t('common.confirm')}
                displayFormat="long"
                testID="date-of-birth-picker"
                error={errors.dateOfBirth}
              />
            </View>

            {/* Riding Styles Section */}
            <View style={styles.inputGroup}>
              <MultiSelect
                label={t('screens.editProfile.riding_styles')}
                data={EnumUtils.getRidingStyleDropdownOptions()}
                selectedItems={selectedRidingStyles}
                onSelectionChange={handleRidingStylesChange}
                error={errors.ridingStyles?.message}
                testID="riding-styles-multiselect"
              />
            </View>

            {/* Interests Section */}
            <View style={styles.inputGroup}>
              <MultiSelect
                label={t('screens.editProfile.interests')}
                data={EnumUtils.getInterestDropdownOptions()}
                selectedItems={selectedInterests}
                onSelectionChange={handleInterestsChange}
                error={errors.interests?.message}
                testID="interests-multiselect"
              />
            </View>
          </View>

          {/* Social Media Section */}
          <View style={styles.section}>
            <Subtitle weight="bold" style={styles.sectionTitle}>
              {t('screens.editProfile.social_media')}
            </Subtitle>
            {/* Add Social Media Buttons */}
            <View style={styles.socialMediaButtons}>
              {Object.values(SocialMediaPlatform).map(platform => {
                const exists = userSocialMediaProfiles.some(
                  sm => sm.platform === platform,
                );
                return (
                  <Button
                    key={platform}
                    size="small"
                    variant="outline"
                    shape="circle"
                    style={[
                      styles.socialMediaButton,
                      exists && styles.socialMediaButtonActive,
                    ]}
                    onPress={() => handleAddSocialMedia(platform)}
                    iconName={getSocialMediaIcon(platform)}
                    iconSize={20}
                    iconColor={
                      exists ? colors.neutral.white : colors.neutral.grey
                    }
                  />
                );
              })}
            </View>

            {/* Social Media Inputs */}
            {userSocialMediaProfiles.map(sm => {
              return (
                <View key={sm.platform} style={styles.inputGroup}>
                  <AnimatedInput
                    label={
                      sm.platform.charAt(0).toUpperCase() +
                      sm.platform.slice(1).toLowerCase()
                    }
                    showClearButton={false}
                    prefix={getSocialMediaPrefix(sm.platform)}
                    value={sm.username}
                    onChangeText={value =>
                      handleUpdateSocialMedia(sm.platform, 'username', value)
                    }
                  />
                </View>
              );
            })}
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>

      {/* Save Button - Fixed at bottom */}
      <View style={styles.buttonContainer}>
        <Button
          variant="dark"
          shape="round"
          title={t('common.update')}
          onPress={handleSubmit(onSubmit)}
          disabled={updateLoading}
        />
      </View>
      <LoadingIndicator visible={updateLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  topHeaderBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: radius.round,
    borderWidth: 2,
    borderColor: colors.neutral.black,
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: colors.neutral.black,
    borderRadius: radius.round,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  socialMediaButtons: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  socialMediaButton: {
    width: 40,
    height: 40,
  },
  socialMediaButtonActive: {
    borderColor: colors.neutral.black,
    backgroundColor: colors.neutral.black,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
  },
});
