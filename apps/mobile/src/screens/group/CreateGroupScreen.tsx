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
import {useForm, Controller} from 'react-hook-form';
import {
  TopHeaderBar,
  AnimatedInput,
  Button,
  Typography,
  Dropdown,
  Icon,
  Chip,
} from '@components';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing, radius, screenWidth, screenHeight} from '@theme';
import {launchImageLibrary} from 'react-native-image-picker';

// Interface for dropdown items
interface PrivacyOption {
  id: number;
  label: string;
  value: string;
}

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
const privacyOptions: PrivacyOption[] = [
  {id: 1, label: 'Public', value: 'public'},
  {id: 2, label: 'Private', value: 'private'},
  {id: 3, label: 'Members Only', value: 'members-only'},
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
  const insets = useSafeAreaInsets();
  const [selectedPrivacy, setSelectedPrivacy] = useState<PrivacyOption | null>(
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
      if (selectedTags.length < 5) {
        setSelectedTags([...selectedTags, tag]);
      } else {
        Alert.alert('Limit Reached', 'You can select up to 5 tags');
      }
    }
  };

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
      <SafeAreaView style={[styles.safeArea, {paddingBottom: insets.bottom}]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}>
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
                  <Icon name="users" size={24} color={colors.neutral.grey} />
                  <Typography
                    variant="caption"
                    color={colors.neutral.grey}
                    style={styles.uploadText}>
                    Upload group logo
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Group Cover Image Selection */}
          <TouchableOpacity
            style={styles.coverImageContainer}
            onPress={handleSelectCoverImage}
            activeOpacity={0.8}>
            {coverImage ? (
              <Image source={{uri: coverImage}} style={styles.coverImage} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Icon name="plus" size={24} color={colors.neutral.grey} />
                <Typography variant="bodySmall" color={colors.neutral.grey}>
                  Upload cover image (optional)
                </Typography>
              </View>
            )}
          </TouchableOpacity>

          {/* Group Name */}
          <View style={styles.formField}>
            <AnimatedInput
              control={control}
              name="name"
              label="Group Name"
              error={errors.name}
              iconPosition="left"
              icon={<Icon name="users" size={20} color={colors.neutral.grey} />}
            />
          </View>

          {/* Group Description */}
          <View style={styles.formField}>
            <AnimatedInput
              control={control}
              name="description"
              label="Description"
              error={errors.description}
              iconPosition="left"
              icon={
                <Icon name="comment" size={20} color={colors.neutral.grey} />
              }
            />
          </View>

          {/* Location */}
          <View style={styles.formField}>
            <AnimatedInput
              control={control}
              name="location"
              label="Location"
              error={errors.location}
              iconPosition="left"
              icon={
                <Icon name="map-pin" size={20} color={colors.neutral.grey} />
              }
            />
          </View>

          {/* Privacy Setting Dropdown */}
          <View style={styles.formField}>
            <Typography variant="bodySmall" style={styles.fieldLabel}>
              Privacy Setting
            </Typography>
            <Controller
              control={control}
              name="privacy"
              render={({field: {onChange}}) => (
                <Dropdown
                  data={privacyOptions}
                  placeholder="Select privacy setting"
                  onSelect={item => {
                    if (item) {
                      setSelectedPrivacy(item as PrivacyOption);
                      onChange(item.value);
                    }
                  }}
                  searchable={false}
                  selectedItem={selectedPrivacy}
                  containerStyle={styles.dropdown}
                  error={errors.privacy?.message}
                />
              )}
            />
          </View>

          {/* Max Members */}
          <View style={styles.formField}>
            <AnimatedInput
              control={control}
              name="maxMembers"
              label="Maximum Members (optional)"
              error={errors.maxMembers}
              iconPosition="left"
              keyboardType="numeric"
              icon={<Icon name="users" size={20} color={colors.neutral.grey} />}
            />
          </View>

          {/* Tags Selection */}
          <View style={styles.tagsSection}>
            <Typography variant="bodySmall" style={styles.fieldLabel}>
              Tags (Select up to 5)
            </Typography>
            <View style={styles.tagsContainer}>
              {availableTags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onPress={() => handleTagToggle(tag)}
                  size="small"
                  variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                  color={selectedTags.includes(tag) ? 'primary' : undefined}
                  style={styles.tagChip}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Create Group"
            variant="primary"
            size="large"
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
  scrollViewContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  topHeaderBar: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  imageSelectionContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  groupImageContainer: {
    width: screenWidth * 0.3,
    height: screenWidth * 0.3,
    borderRadius: radius.round,
    overflow: 'hidden',
    backgroundColor: colors.neutral.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
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
    height: screenHeight * 0.2,
    marginTop: spacing.lg,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.neutral.lightGrey,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: radius.md,
  },
  coverPlaceholder: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formField: {
    marginTop: spacing.lg,
  },
  fieldLabel: {
    marginBottom: spacing.xs,
    color: colors.neutral.darkGrey,
  },
  dropdown: {
    marginBottom: spacing.sm,
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
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGrey,
  },
});
