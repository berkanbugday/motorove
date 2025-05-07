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
import {useQuery} from '@apollo/client';
import {
  GET_CITIES,
  GET_GROUP_PRIVACY_OPTIONS,
  GET_GROUP_TAGS,
} from '@services/graphql/enum.graphql';

export const CreateGroupScreen: React.FC = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'CreateGroup'>>();
  const [selectedPrivacy, setSelectedPrivacy] = useState<DropdownItem | null>(
    null,
  );
  const [selectedCity, setSelectedCity] = useState<DropdownItem | null>(null);
  const [selectedTags, setSelectedTags] = useState<
    {key: string; value: string}[]
  >([]);
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch cities from GraphQL API
  const {data: citiesData, loading: citiesLoading} = useQuery(GET_CITIES);

  // Fetch privacy options from GraphQL API
  const {data: privacyData, loading: privacyLoading} = useQuery(
    GET_GROUP_PRIVACY_OPTIONS,
  );

  // Fetch tags from GraphQL API
  const {data: tagsData} = useQuery(GET_GROUP_TAGS);

  // Transform cities data for dropdown
  const cityOptions: DropdownItem[] = React.useMemo(() => {
    if (!citiesData?.getCities) {
      return [];
    }
    return citiesData.getCities.map(
      (city: {key: string; value: string}, index: number) => ({
        id: index + 1,
        label: city.value,
        value: city.key,
      }),
    );
  }, [citiesData]);

  // Transform privacy options data for dropdown
  const privacyOptions: DropdownItem[] = React.useMemo(() => {
    if (!privacyData?.getGroupPrivacyOptions) {
      return [];
    }
    return privacyData.getGroupPrivacyOptions.map(
      (privacy: {key: string; value: string}, index: number) => ({
        id: index + 1,
        label: privacy.value,
        value: privacy.key,
      }),
    );
  }, [privacyData]);

  const tags: {key: string; value: string}[] = React.useMemo(() => {
    if (!tagsData?.getGroupTags) {
      return [];
    }
    return tagsData.getGroupTags;
  }, [tagsData]);
  // Setup form with Zod validation
  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      description: '',
      city: '',
      privacy: '',
      maxMembers: null,
      tags: [],
      groupImage: null,
      coverImage: null,
    },
    mode: 'onChange',
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSelectGroupImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri || '';
        setGroupImage(uri);
        setValue('groupImage', uri, {shouldValidate: true});
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  const handleSelectCoverImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri || '';
        setCoverImage(uri);
        setValue('coverImage', uri, {shouldValidate: true});
      }
    } catch (error) {
      console.error('Error selecting cover image:', error);
    }
  };

  const handleTagToggle = (tag: {key: string; value: string}) => {
    if (selectedTags.includes(tag)) {
      const newTags = selectedTags.filter(t => t !== tag);
      setSelectedTags(newTags);
      setValue(
        'tags',
        newTags.map(t => t.key),
        {shouldValidate: true},
      );
    } else {
      if (selectedTags.length < 3) {
        const newTags = [...selectedTags, tag];
        setSelectedTags(newTags);
        setValue(
          'tags',
          newTags.map(t => t.key),
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
      setIsSubmitting(true);

      // Combine form data with selected images and tags
      const groupData = {
        ...data,
        privacy: selectedPrivacy?.value || 'public',
        city: selectedCity?.value || '',
        groupImage,
        coverImage,
        tags: selectedTags,
      };

      console.log('Creating group with data:', groupData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Here you would call your API to create the group
      showToast({
        type: 'success',
        text1: 'Success',
        text2: 'Group created successfully!',
      });
      setTimeout(() => {
        navigation.goBack();
      }, 3000);
    } catch (error) {
      console.error('Error creating group:', error);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create group. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
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
            style={styles.coverImageContainer}
            onPress={handleSelectCoverImage}
            activeOpacity={0.8}>
            {coverImage ? (
              <Image source={{uri: coverImage}} style={styles.coverImage} />
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
              style={styles.groupImageContainer}
              onPress={handleSelectGroupImage}
              activeOpacity={0.8}>
              {groupImage ? (
                <Image source={{uri: groupImage}} style={styles.groupImage} />
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
                data={cityOptions}
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
                name="maxMembers"
                label="Members Capacity (optional)"
                error={errors.maxMembers}
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
                {tags.map((tag: {key: string; value: string}) => (
                  <Chip
                    key={tag.key}
                    label={tag.value}
                    onPress={() => handleTagToggle(tag)}
                    size="medium"
                    variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
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
            title={isSubmitting ? 'Creating...' : 'Create Group'}
            variant="dark"
            size="medium"
            shape="round"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
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
  groupImageContainer: {
    width: 100,
    height: 100,
    borderRadius: radius.round,
    backgroundColor: colors.secondary.light,
    justifyContent: 'center',
    alignItems: 'center',
    ...getShadow('small'),
  },
  groupImage: {
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
  coverImageContainer: {
    height: 150,
    overflow: 'hidden',
    backgroundColor: colors.secondary.light,
  },
  coverImage: {
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
