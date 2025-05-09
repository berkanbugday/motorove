import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  TopHeaderBar,
  AnimatedInput,
  Button,
  Typography,
  Dropdown,
  Chip,
  DropdownItem,
  showToast,
} from '@components';
import {colors, spacing, radius, getShadow} from '@theme';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  createGroupSchema,
  CreateGroupFormValues,
} from '@utils/validation/groupValidation';
import {loggingService} from '@services/logging.service';
import {useEnumPrivacyOptions} from '@services/enum.service';
import {useCreateGroup, GroupInput} from '@services/group.service';
import {useGetCities} from '@services/city.service';
import {useGetGroupTags} from '@services/group-tag.service';

export const CreateGroupScreen: React.FC = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'CreateGroup'>>();
  const [selectedPrivacy, setSelectedPrivacy] = useState<DropdownItem | null>(
    null,
  );
  const [selectedCity, setSelectedCity] = useState<DropdownItem | null>(null);
  const [selectedTags, setSelectedTags] = useState<
    {id: string; value: string}[]
  >([]);
  const [logo, setLogo] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);

  // Use enum service hooks
  const {cities, loading: citiesLoading} = useGetCities();
  const {privacyOptions, loading: privacyLoading} = useEnumPrivacyOptions();
  const {groupTags} = useGetGroupTags();

  // Use group service hook for creating a group
  const {createGroup, loading: createGroupLoading} = useCreateGroup(() => {
    // On success callback
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  });

  // Setup form with Zod validation
  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: 'Deneme',
      description: 'Deneme test',
      logo: null,
      cover: null,
      city: '',
      privacy: '',
      membersCapacity: null,
      tags: [],
    },
    mode: 'onChange',
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSelectLogo = async () => {
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
            text1: 'File too large',
            text2: 'Please select an image smaller than 10MB',
          });
          return;
        }

        // Use base64 data instead of URI
        setLogo(asset.uri || '');
        setValue(
          'logo',
          asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null,
          {
            shouldValidate: true,
          },
        );
      }
    } catch (error) {
      loggingService.error('Error selecting image:', error);
    }
  };

  const handleSelectCover = async () => {
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
            text1: 'File too large',
            text2: 'Please select an image smaller than 10MB',
          });
          return;
        }

        // Use base64 data instead of URI
        setCover(asset.uri || '');
        setValue(
          'cover',
          asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null,
          {
            shouldValidate: true,
          },
        );
      }
    } catch (error) {
      loggingService.error('Error selecting cover image:', error);
    }
  };

  const handleTagToggle = (tag: {id: string; value: string}) => {
    if (selectedTags.some(t => t.id === tag.id)) {
      const newTags = selectedTags.filter(t => t.id !== tag.id);
      setSelectedTags(newTags);
      setValue(
        'tags',
        newTags.map(t => t.id),
        {shouldValidate: true},
      );
    } else {
      if (selectedTags.length < 3) {
        const newTags = [...selectedTags, tag];
        setSelectedTags(newTags);
        setValue(
          'tags',
          newTags.map(t => t.id),
          {shouldValidate: true},
        );
      } else {
        showToast({
          type: 'warning',
          text1: 'Limit Reached',
          text2: 'You can select up to 3 tags',
        });
      }
    }
  };

  function handlePrivacySelect(item: DropdownItem | null) {
    setSelectedPrivacy(item);
    setValue('privacy', item?.value || '', {shouldValidate: true});
  }

  function handleCitySelect(item: DropdownItem | null) {
    setSelectedCity(item);
    setValue('city', item?.value || '', {shouldValidate: true});
  }

  const onSubmit = async (data: CreateGroupFormValues) => {
    try {
      // Prepare form data for the group service
      const createGroupInput: GroupInput = {
        name: data.name,
        description: data.description,
        logo: data.logo,
        cover: data.cover,
        city: {
          id: selectedCity?.id as string,
          value: selectedCity?.label as string,
        },
        privacy: selectedPrivacy?.value,
        membersCapacity: data.membersCapacity
          ? parseInt(data.membersCapacity.toString(), 10)
          : null,
        tags: selectedTags.map(tag => ({
          id: tag.id,
          value: tag.value,
        })),
      };

      // Call the group service createGroup method
      await createGroup(createGroupInput);
    } catch (error) {
      loggingService.error('Error in onSubmit:', error);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create group. Please try again.',
      });
    }
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title="Create Group"
        showBackButton
        onBackPress={handleGoBack}
        containerStyle={styles.topHeaderBar}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          {/* Group Cover Image Selection - Moved to top */}
          <TouchableOpacity
            style={styles.coverContainer}
            onPress={handleSelectCover}
            activeOpacity={0.8}>
            {cover ? (
              <Image source={{uri: cover}} style={styles.cover} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Typography variant="bodySmall" color={colors.neutral.grey}>
                  Upload cover image
                </Typography>
              </View>
            )}
          </TouchableOpacity>
          {/* Group Profile Image Selection */}
          <View style={styles.imageSelectionContainer}>
            <TouchableOpacity
              style={styles.logoContainer}
              onPress={handleSelectLogo}
              activeOpacity={0.8}>
              {logo ? (
                <Image source={{uri: logo}} style={styles.logo} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Typography
                    variant="caption"
                    color={colors.neutral.grey}
                    style={styles.uploadText}>
                    Upload logo
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            {/* Group Name */}
            <View style={styles.formFields}>
              <AnimatedInput
                control={control}
                name="name"
                label="Group Name"
                error={errors.name}
              />

              {/* Group Description */}
              <AnimatedInput
                control={control}
                name="description"
                label="Description"
                multiline
                error={errors.description}
              />

              {/* City Dropdown */}
              <Dropdown
                data={cities.map(city => ({
                  label: city.value,
                  value: city.id,
                  id: city.id,
                }))}
                label="City"
                onSelect={item => {
                  handleCitySelect(item);
                }}
                searchable={true}
                selectedItem={selectedCity}
                error={errors.city?.message}
                loading={citiesLoading}
              />

              {/* Privacy Setting Dropdown */}
              <Dropdown
                data={privacyOptions}
                label="Privacy"
                placeholder="Select privacy"
                onSelect={item => {
                  handlePrivacySelect(item);
                }}
                searchable={false}
                selectedItem={selectedPrivacy}
                error={errors.privacy?.message}
                loading={privacyLoading}
              />

              {/* Max Members */}
              <AnimatedInput
                control={control}
                name="membersCapacity"
                label="Members Capacity (optional)"
                error={errors.membersCapacity}
                keyboardType="numeric"
              />
            </View>

            {/* Tags Selection */}
            <View style={styles.tagsSection}>
              <Typography variant="bodySmall" style={styles.fieldLabel}>
                Tags (Select up to 3)
              </Typography>
              {errors.tags && (
                <Typography
                  variant="caption"
                  color={colors.status.error}
                  style={styles.errorText}>
                  {errors.tags.message}
                </Typography>
              )}
              <View style={styles.tagsContainer}>
                {groupTags.map(tag => (
                  <Chip
                    key={tag.id}
                    label={tag.value}
                    onPress={() => handleTagToggle(tag)}
                    size="medium"
                    variant={
                      selectedTags.some(t => t.id === tag.id)
                        ? 'filled'
                        : 'outlined'
                    }
                    color="dark"
                    style={styles.tagChip}
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={createGroupLoading ? 'Creating...' : 'Create Group'}
            variant="dark"
            size="medium"
            shape="round"
            onPress={handleSubmit(onSubmit)}
            loading={createGroupLoading}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  topHeaderBar: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  imageSelectionContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: radius.round,
    backgroundColor: colors.secondary.light,
    justifyContent: 'center',
    alignItems: 'center',
    ...getShadow('small'),
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: radius.round,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  uploadText: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  coverContainer: {
    height: 150,
    overflow: 'hidden',
    backgroundColor: colors.secondary.light,
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formFields: {
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  fieldLabel: {
    marginBottom: spacing.xs,
    color: colors.neutral.darkGrey,
  },
  tagsSection: {
    marginTop: spacing.lg,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  tagChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.light,
  },
  errorText: {
    marginBottom: spacing.xs,
  },
});
