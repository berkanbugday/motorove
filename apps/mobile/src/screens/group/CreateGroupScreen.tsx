import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
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
} from '@components';
import {colors, spacing, radius, getShadow} from '@theme';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  createGroupSchema,
  CreateGroupFormValues,
} from '@utils/validation/groupValidation';

// Privacy options for dropdown
const privacyOptions: DropdownItem[] = [
  {id: 1, label: 'Public', value: 'public'},
  {id: 2, label: 'Private', value: 'private'},
];

// City options for dropdown
const cityOptions: DropdownItem[] = [
  {id: 1, label: 'New York', value: 'new-york'},
  {id: 2, label: 'Los Angeles', value: 'los-angeles'},
  {id: 3, label: 'Chicago', value: 'chicago'},
  {id: 4, label: 'Houston', value: 'houston'},
  {id: 5, label: 'Phoenix', value: 'phoenix'},
  {id: 6, label: 'Philadelphia', value: 'philadelphia'},
  {id: 7, label: 'San Antonio', value: 'san-antonio'},
  {id: 8, label: 'San Diego', value: 'san-diego'},
  {id: 9, label: 'Dallas', value: 'dallas'},
  {id: 10, label: 'San Francisco', value: 'san-francisco'},
  {id: 11, label: 'Austin', value: 'austin'},
  {id: 12, label: 'Seattle', value: 'seattle'},
  {id: 13, label: 'Denver', value: 'denver'},
  {id: 14, label: 'Boston', value: 'boston'},
  {id: 15, label: 'Portland', value: 'portland'},
];

// Tags for selection
const availableTags = [
  'Touring',
  'Off-Road',
  'Adventure',
  'Sport',
  'Cruiser',
  'Vintage',
  'Racing',
  'Weekend Rides',
  'Daily Commute',
  'Long Distance',
];

export const CreateGroupScreen: React.FC = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'CreateGroup'>>();
  const [selectedPrivacy, setSelectedPrivacy] = useState<DropdownItem | null>(
    null,
  );
  const [selectedCity, setSelectedCity] = useState<DropdownItem | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      const newTags = selectedTags.filter(t => t !== tag);
      setSelectedTags(newTags);
      setValue('tags', newTags, {shouldValidate: true});
    } else {
      if (selectedTags.length < 3) {
        const newTags = [...selectedTags, tag];
        setSelectedTags(newTags);
        setValue('tags', newTags, {shouldValidate: true});
      } else {
        Alert.alert('Limit Reached', 'You can select up to 3 tags');
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
      Alert.alert('Success', 'Group created successfully!', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
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
                placeholder="Select city"
                onSelect={item => {
                  handleCitySelect(item);
                }}
                searchable={true}
                selectedItem={selectedCity}
                error={errors.city?.message}
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
                {availableTags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
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
