import React, {useEffect, useState} from 'react';
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ImageStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {colors, spacing, radius, typography} from '@theme';
import {Icon} from '@components/Icon';
import {TopHeaderBar} from '@components/TopHeaderBar';
import {useAuth} from '@contexts/AuthContext';
import {
  Button,
  Chip,
  DropdownItem,
  Dropdown,
  Subtitle,
  PostLocationMap,
  Body,
  showToast,
} from '@components';
import {GroupCard} from '@components/GroupCard';
import {launchImageLibrary} from 'react-native-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {loggingService} from '@services/logging.service';
import {useUpdatePost, useGetPost} from '@services/post.service';
import {PostAddressInput, UpdatePostInput} from '../../types/models/post.model';
import {openBottomSheet, closeBottomSheet} from '@components/BottomSheet';
import {useGetJoinedGroups} from '@services/group.service';
import {LegendList} from '@legendapp/list';
import {MainStackParamList} from '@navigation/types/navigationTypes';

export const EditPostScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MainStackParamList, 'EditPost'>>();
  const {postId} = route.params;

  const [postText, setPostText] = useState('');
  const [selectedPrivacy, setSelectedPrivacy] = useState<DropdownItem | null>(
    null,
  );
  const [selectedImages, setSelectedImages] = useState<
    {id: number; uri: string; base64?: string}[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{
    latitude?: number;
    longitude?: number;
    addresses: PostAddressInput[];
  }>({addresses: []});
  const [selectedGroup, setSelectedGroup] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Fetch the post data
  const {post, loading: loadingPost} = useGetPost(postId);

  // Fetch joined groups using the hook
  const {
    groups: joinedGroups,
    loading: loadingGroups,
    error: groupsError,
    refetch: refetchJoinedGroups,
  } = useGetJoinedGroups();

  const {user} = useAuth();
  const insets = useSafeAreaInsets();

  // Use the updatePost hook from PostService
  const {updatePost} = useUpdatePost(() => {
    navigation.goBack();
  });

  // Initialize form with post data when it loads
  useEffect(() => {
    if (post) {
      setPostText(post.content || '');

      // Set location if available
      if (post.latitude && post.longitude) {
        setLocation({
          latitude: post.latitude,
          longitude: post.longitude,
          addresses: post.addresses || [],
        });
      }

      // Set privacy and group if post is in a group
      if (post.group) {
        setSelectedPrivacy({
          id: 2,
          label: 'Group',
          value: 'group',
        });
        setSelectedGroup({
          id: post.group.id,
          name: post.group.name,
        });
      } else {
        setSelectedPrivacy({
          id: 1,
          label: 'Public',
          value: 'public',
        });
      }

      // Set images if available
      if (post.images && post.images.length > 0) {
        const formattedImages = post.images.map((uri, index) => ({
          id: Date.now() + index,
          uri,
        }));
        setSelectedImages(formattedImages);
      }
    }
  }, [post]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handlePrivacyChange = (item: DropdownItem | null) => {
    setSelectedPrivacy(item);

    // If group is selected, open the group selection bottom sheet
    if (item?.value === 'group') {
      openGroupSelectionBottomSheet();
    } else {
      // If other privacy option is selected, clear the selected group
      setSelectedGroup(null);
    }
  };

  const openGroupSelectionBottomSheet = () => {
    openBottomSheet({
      title: 'Select Group',
      closeButtonPosition: 'top-left',
      content: (
        <>
          {loadingGroups ? (
            <ActivityIndicator size="large" color={colors.primary.main} />
          ) : groupsError ? (
            <View style={styles.errorContainer}>
              <Icon name="error" size={24} color={colors.status.error} />
              <Body>Failed to load groups. Please try again.</Body>
              <Button
                title="Retry"
                variant="primary"
                onPress={() => refetchJoinedGroups()}
                size="small"
              />
            </View>
          ) : joinedGroups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="users" size={24} color={colors.neutral.grey} />
              <Body>You haven't joined any groups yet</Body>
            </View>
          ) : (
            <LegendList
              data={joinedGroups}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <GroupCard
                  logoSource={item.logo ? {uri: item.logo} : null}
                  name={item.name}
                  location={item.city?.value}
                  tags={item.tags?.map(tag => tag.value) || []}
                  currentMembers={item.memberships?.length || 0}
                  membersCapacity={item.membersCapacity || undefined}
                  privacy={item.privacy}
                  isMember={true}
                  onPress={() => {
                    setSelectedGroup({id: item.id, name: item.name});
                    closeBottomSheet();
                  }}
                />
              )}
              contentContainerStyle={styles.groupListContainer}
              showsVerticalScrollIndicator={false}
              recycleItems={true}
              maintainVisibleContentPosition={true}
            />
          )}
        </>
      ),
      snapPoint: 'full',
    });
  };

  const handleSelectImage = async () => {
    if (selectedImages.length >= 3) {
      showToast({
        type: 'error',
        text1: 'Limit Reached',
        text2: 'You can select a maximum of 3 images',
      });
      return;
    }

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

        const newImage = {
          id: Date.now(),
          uri: asset.uri || '',
          base64: asset.base64
            ? `data:image/jpeg;base64,${asset.base64}`
            : undefined,
        };
        setSelectedImages([...selectedImages, newImage]);
      }
    } catch (error) {
      loggingService.error('Error selecting image:', error);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to select image. Please try again.',
      });
    }
  };

  const handleRemoveImage = (id: number) => {
    setSelectedImages(selectedImages.filter(image => image.id !== id));
  };

  const handleAddLocation = () => {
    // Open bottom sheet with map
    openBottomSheet({
      title: 'Select Location',
      content: (
        <PostLocationMap
          initialLocation={location}
          onLocationSelect={selectedLocation => {
            setLocation({
              ...selectedLocation,
              addresses: selectedLocation.addresses || [],
            });
            closeBottomSheet();
          }}
          onClose={() => closeBottomSheet()}
        />
      ),
      snapPoint: 'full',
      enableGestureControl: false,
      closeButtonPosition: 'top-left',
    });
  };

  const handleUpdate = async () => {
    if (!postText.trim()) {
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter some content for your post',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Use base64 encoded images if available, otherwise fall back to URIs
      const imageData = selectedImages.map(img => img.base64 || img.uri);

      // Create update post input data
      const updatePostInput: UpdatePostInput = {
        id: postId,
        content: postText.trim(),
        images: imageData.length > 0 ? imageData : undefined,
        ...(location.latitude && location.longitude
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
            }
          : {latitude: null, longitude: null}),
        ...(selectedPrivacy?.value === 'group' && selectedGroup
          ? {groupId: selectedGroup.id}
          : {groupId: null}),
        addresses: location.addresses,
      };

      // Call the updatePost function from the hook
      await updatePost(updatePostInput);

      // Toast is handled by the hook's onSuccess callback
    } catch (error) {
      loggingService.error('Error updating post:', error);
      // Error toast is already handled by the hook
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingPost) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title="Edit Post"
        showBackButton
        showShadow={false}
        onBackPress={handleGoBack}
        containerStyle={styles.topHeaderBar}
      />
      <SafeAreaView style={[styles.container, {paddingBottom: insets.bottom}]}>
        <ScrollView>
          {/* User Profile Section */}
          <View style={styles.profileSection}>
            <Image
              source={{uri: 'https://picsum.photos/id/1005/100/100'}}
              style={styles.avatar as ImageStyle}
            />
            <View style={styles.profileInfo}>
              <Subtitle style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Subtitle>
              <Dropdown
                data={[
                  {id: 1, label: 'Public', value: 'public'},
                  {id: 2, label: 'Group', value: 'group'},
                ]}
                placeholder="Select privacy"
                onSelect={handlePrivacyChange}
                searchable={false}
                selectedItem={selectedPrivacy}
                containerStyle={styles.privacySelector}
                inputStyle={styles.privacyInput}
              />

              {selectedPrivacy?.value === 'group' && selectedGroup && (
                <Chip
                  label={selectedGroup.name}
                  leadingIcon="users-filled"
                  size="small"
                  variant="filled"
                  color="secondary"
                  onPress={openGroupSelectionBottomSheet}
                />
              )}
            </View>
          </View>

          {/* Post Input Field */}
          <TextInput
            style={styles.postInput as TextStyle}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.neutral.grey}
            multiline
            value={postText}
            onChangeText={setPostText}
          />

          {/* Image Gallery */}
          <View style={styles.imagesContainer}>
            <ScrollView
              contentContainerStyle={styles.imageWrapper}
              horizontal
              showsHorizontalScrollIndicator={false}>
              {selectedImages.map(image => (
                <View key={image.id} style={styles.imageContainer}>
                  <Image
                    source={{uri: image.uri}}
                    style={styles.postImage as ImageStyle}
                  />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveImage(image.id)}>
                    <Icon name="close" size={14} color={colors.neutral.white} />
                  </TouchableOpacity>
                </View>
              ))}
              {selectedImages.length < 3 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={handleSelectImage}>
                  <Icon name="plus" size={24} color={colors.neutral.grey} />
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <Button
              variant="text"
              iconName="map-pin"
              iconColor={colors.neutral.black}
              iconSize={18}
              onPress={handleAddLocation}
              textStyle={styles.actionButtonText}
              title={
                location.addresses.length > 0
                  ? location.addresses.find(
                      address => address.language === 'en',
                    )?.address
                  : 'Add location'
              }
            />
          </View>
        </ScrollView>

        {/* Update Button */}
        <View style={styles.postButtonContainer}>
          <Button
            variant="dark"
            size="medium"
            shape="round"
            onPress={handleUpdate}
            title="Update"
            loading={isLoading}
            disabled={
              isLoading ||
              !postText.trim() ||
              (selectedPrivacy?.value === 'group' && !selectedGroup)
            }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
  },
  topHeaderBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.light,
  },
  profileSection: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.round,
    backgroundColor: colors.secondary.light,
  },
  profileInfo: {
    width: '80%',
    marginLeft: spacing.sm,
  },
  profileName: {
    marginBottom: spacing.xs,
  },
  privacySelector: {
    width: '70%',
    marginBottom: spacing.sm,
  },
  privacyInput: {
    height: 40,
  },
  postInput: {
    ...(typography.body as TextStyle),
    color: colors.neutral.black,
    padding: spacing.md,
    height: 150,
    textAlignVertical: 'top',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.secondary.light,
    borderRadius: radius.sm,
  },
  imagesContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  imageWrapper: {
    padding: 10,
    gap: spacing.md,
  },
  imageContainer: {
    position: 'relative',
  },
  postImage: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
    backgroundColor: colors.secondary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: colors.primary.light,
    borderRadius: radius.round,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.secondary.light,
    alignItems: 'flex-start',
  },
  actionButtonText: {
    ...(typography.bodySmall as TextStyle),
  },
  postButtonContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.light,
  },
  groupListContainer: {
    paddingBottom: spacing.lg,
  },
  errorContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  emptyContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
});
