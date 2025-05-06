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

// Form data type
interface GroupFormData {
  name: string;
  description: string;
  location: string;
  privacy: string;
  maxMembers: number | null;
  tags: string[];
}

// Privacy options for dropdown
const privacyOptions: DropdownItem[] = [
  {id: 1, label: 'Public', value: 'public'},
  {id: 2, label: 'Private', value: 'private'},
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Setup form (simplified without validation library)
  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm<GroupFormData>({
    defaultValues: {
      name: '',
      description: '',
      location: '',
      privacy: '',
      maxMembers: null,
      tags: [],
    },
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
        setGroupImage(result.assets[0].uri || '');
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
        setCoverImage(result.assets[0].uri || '');
      }
    } catch (error) {
      console.error('Error selecting cover image:', error);
    }
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length < 3) {
        setSelectedTags([...selectedTags, tag]);
      } else {
        Alert.alert('Limit Reached', 'You can select up to 3 tags');
      }
    }
  };

  function handlePrivacySelect(item: DropdownItem | null) {
    setSelectedPrivacy(item);
    setValue('privacy', item?.value || '', {shouldValidate: true});
  }

  const onSubmit = (data: GroupFormData) => {
    // Combine form data with selected images and tags
    const groupData = {
      ...data,
      privacy: selectedPrivacy?.value || 'public',
      groupImage,
      coverImage,
      tags: selectedTags,
    };

    console.log('Creating group with data:', groupData);

    // Here you would call your API to create the group
    // For now, just navigate back
    Alert.alert('Success', 'Group created successfully!', [
      {text: 'OK', onPress: () => navigation.goBack()},
    ]);
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

              {/* Location */}

              <AnimatedInput
                control={control}
                name="location"
                label="Location"
                error={errors.location}
              />

              {/* Privacy Setting Dropdown */}
              <Dropdown
                data={privacyOptions}
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
            title="Create Group"
            variant="dark"
            size="medium"
            shape="round"
            onPress={handleSubmit(onSubmit)}
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
});
