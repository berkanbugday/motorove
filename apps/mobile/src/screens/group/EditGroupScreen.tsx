import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
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
  updateGroupSchema,
  UpdateGroupFormValues,
} from '@utils/validation/groupValidation';
import {loggingService} from '@services/logging.service';
import {useEnumPrivacyOptions} from '@services/enum.service';
import {
  useUpdateGroup,
  UpdateGroupInput,
  useGetGroup,
} from '@services/group.service';
import {useGetCities} from '@services/city.service';
import {useGetGroupTags} from '@services/group-tag.service';

// Since we can't modify the navigationTypes file directly in this example,
// define a local type for the route params
type EditGroupParams = {
  groupId: string;
};

// Note: Using Group type from the group service

export const EditGroupScreen: React.FC = () => {
  // We'll use 'any' for now to bypass the type checking, but in a real app
  // you'd update the navigationTypes.ts file to include EditGroup
  const navigation = useNavigation<any>();
  const route =
    useRoute<RouteProp<{EditGroup: EditGroupParams}, 'EditGroup'>>();
  const {groupId} = route.params;

  const [selectedPrivacy, setSelectedPrivacy] = useState<DropdownItem | null>(
    null,
  );
  const [selectedCity, setSelectedCity] = useState<DropdownItem | null>(null);
  const [selectedTags, setSelectedTags] = useState<
    {id: string; value: string}[]
  >([]);
  const [logo, setLogo] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Track if data has been loaded to form
  const isDataLoadedRef = useRef(false);
  // Use service hooks
  const {cities, loading: citiesLoading} = useGetCities();
  const {privacyOptions, loading: privacyLoading} = useEnumPrivacyOptions();
  const {groupTags} = useGetGroupTags();

  // Get group data using the group service
  const {
    group,
    loading: groupLoading,
    error: groupError,
  } = useGetGroup(groupId);

  // Use group service hook for updating a group
  const {updateGroup: updateGroup, loading: updateGroupLoading} =
    useUpdateGroup(() => {
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
    reset,
  } = useForm<UpdateGroupFormValues>({
    resolver: zodResolver(updateGroupSchema),
    defaultValues: {
      id: '',
      name: '',
      description: '',
      logo: null,
      cover: null,
      city: '',
      privacy: '',
      membersCapacity: null,
      tags: [],
    },
    mode: 'onChange',
  });

  // Handle group fetch error
  useEffect(() => {
    if (groupError) {
      loggingService.error('Error fetching group data:', groupError);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load group data',
      });
      navigation.goBack();
    }
  }, [groupError, navigation]);

  // Populate form with existing group data only once when data is available
  useEffect(() => {
    // Skip if data already loaded or still loading
    if (isDataLoadedRef.current || groupLoading || !group) {
      return;
    }

    try {
      // Update form values in one go
      reset({
        id: groupId,
        name: group.name,
        description: group.description,
        logo: group.logo,
        cover: group.cover,
        city: group.city?.id || '',
        privacy: group.privacy || '',
        membersCapacity: group.membersCapacity
          ? group.membersCapacity.toString()
          : null,
        tags: group.tags.map(tag => tag.id),
      });

      // Set logo and cover preview
      if (group.logo) {
        setLogo(group.logo);
      }
      if (group.cover) {
        setCover(group.cover);
      }

      // Set selected city
      if (group.city) {
        setSelectedCity({
          id: group.city.id,
          label: group.city.value,
          value: group.city.id,
        });
      }

      // Set selected privacy
      if (group.privacy) {
        const privacyOption = privacyOptions.find(
          option => option.value === group.privacy,
        );
        if (privacyOption) {
          setSelectedPrivacy(privacyOption);
        }
      }

      // Set selected tags
      if (group.tags && group.tags.length > 0) {
        setSelectedTags(
          group.tags.map(tag => ({
            id: tag.id,
            value: tag.value,
          })),
        );
      }

      // Mark data as loaded to prevent further updates
      isDataLoadedRef.current = true;
      setInitialLoading(false);
    } catch (error) {
      loggingService.error('Error populating form data:', error);
    }
  }, [group, groupLoading, privacyOptions, reset]);

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

  const onSubmit = async (data: UpdateGroupFormValues) => {
    try {
      // Prepare form data for the group service
      const updateGroupInput: UpdateGroupInput = {
        id: data.id,
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
          ? parseInt(data.membersCapacity, 10)
          : null,
        tags: selectedTags.map(tag => ({
          id: tag.id,
          value: tag.value,
        })),
      };

      // Call the group service updateGroup method
      await updateGroup(updateGroupInput);
    } catch (error) {
      loggingService.error('Error in onSubmit:', error);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update group. Please try again.',
      });
    }
  };

  // Show loading while fetching initial data
  if (initialLoading || groupLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title="Edit Group"
        showBackButton
        showShadow={false}
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

        {/* Update Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={updateGroupLoading ? 'Updating...' : 'Update Group'}
            variant="dark"
            size="medium"
            shape="round"
            onPress={handleSubmit(onSubmit)}
            loading={updateGroupLoading}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.light,
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
    marginTop: spacing.sm,
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
