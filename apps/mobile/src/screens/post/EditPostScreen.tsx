import React, {useEffect, useLayoutEffect, useState} from 'react';
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
  FlatList,
  BackHandler,
  Platform,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {colors, spacing, radius, typography} from '@theme';
import {useAuth} from '@contexts/AuthContext';
import {
  Button,
  Chip,
  DropdownItem,
  Dropdown,
  Subtitle,
  Body,
  showToast,
  SelectLocationMap,
  Icon,
  TopHeaderBar,
  GroupCard,
  openBottomSheet,
  closeBottomSheet,
} from '@components';
import {launchImageLibrary} from 'react-native-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {loggingService} from '@services/logging.service';
import {useUpdatePost, useGetPost} from '@services/post.service';
import {useGetJoinedGroups} from '@services/group.service';
import {MainStackParamList} from '@navigation/types/navigationTypes';
import {ICreateAddress, AddressType, GroupPrivacy} from '@motorove/shared';
import {useLanguage} from '@contexts/LanguageContext';
import {useTranslation} from '@hooks/useTranslation';
import {EnumUtils} from '@utils/enumUtils';

export const EditPostScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MainStackParamList, 'EditPost'>>();
  const {postId} = route.params;
  const {t} = useTranslation();

  const privacyOptions = EnumUtils.getGroupPrivacyOptions().filter(
    option => option.value !== GroupPrivacy.ALL,
  );

  const [postText, setPostText] = useState('');
  const [selectedPrivacy, setSelectedPrivacy] = useState<DropdownItem | null>(
    privacyOptions.find(option => option.value === GroupPrivacy.PUBLIC) || null,
  );
  const [selectedImages, setSelectedImages] = useState<
    {id: number; uri: string; base64?: string}[]
  >([]);
  const [location, setLocation] = useState<ICreateAddress[]>([]);
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
  const {language} = useLanguage();

  // Use the updatePost hook from PostService
  const {updatePost, loading: isLoading} = useUpdatePost(() => {
    navigation.goBack();
  });

  // Set navigation options to disable iOS swipe back gesture when dirty
  useLayoutEffect(() => {
    if (Platform.OS === 'ios') {
      closeBottomSheet();
    }

    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          closeBottomSheet();
          return false; // Allow default behavior
        },
      );
      return () => backHandler.remove();
    }
  }, [navigation]);

  // Initialize form with post data when it loads
  useEffect(() => {
    if (post) {
      setPostText(post.content || '');

      // Set location if available
      if (post.addresses && post.addresses.length > 0) {
        // Remove __typename, id property from addresses
        const cleanAddresses = post.addresses.map(addr => {
          const {__typename, id, ...cleanAddr} = addr;
          return cleanAddr;
        });
        setLocation(cleanAddresses);
      }

      // Set privacy and group if post is in a group
      if (post.groupId) {
        // Find the group option in privacyOptions
        const groupOption = privacyOptions.find(
          option => option.value === GroupPrivacy.PRIVATE,
        );
        if (groupOption) {
          setSelectedPrivacy(groupOption);
        }

        setSelectedGroup({
          id: post.groupId || '',
          name: post.groupName || '',
        });
      } else {
        // Find the public option in privacyOptions
        const publicOption = privacyOptions.find(
          option => option.value === GroupPrivacy.PUBLIC,
        );
        if (publicOption) {
          setSelectedPrivacy(publicOption);
        }
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
    if (item?.value === GroupPrivacy.PRIVATE) {
      openGroupSelectionBottomSheet();
    } else {
      // If other privacy option is selected, clear the selected group
      setSelectedGroup(null);
    }
  };

  useEffect(() => {
    if (
      !loadingGroups &&
      selectedPrivacy?.value === GroupPrivacy.PRIVATE &&
      !selectedGroup
    ) {
      openGroupSelectionBottomSheet();
    }
  }, [loadingGroups, selectedPrivacy, selectedGroup]);

  const openGroupSelectionBottomSheet = () => {
    openBottomSheet({
      title: t('screens.post.select_group'),
      closeButtonPosition: 'top-left',
      closeOnBackdropPress: false,
      content: (
        <>
          {loadingGroups ? (
            <ActivityIndicator size="large" />
          ) : groupsError ? (
            <View style={styles.errorContainer}>
              <Icon name="error" size={24} color={colors.status.error} />
              <Body>{t('screens.group.could_not_load_groups')}</Body>
              <Button
                title={t('common.try_again')}
                variant="primary"
                onPress={() => refetchJoinedGroups()}
                size="small"
              />
            </View>
          ) : joinedGroups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="users" size={24} color={colors.neutral.grey} />
              <Body>{t('screens.post.no_groups_joined')}</Body>
            </View>
          ) : (
            <FlatList
              data={joinedGroups}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <GroupCard
                  logoSource={item.logo ? {uri: item.logo} : null}
                  name={item.name}
                  location={item.city?.value}
                  // tags={item.tags?.map(tag => tag.name) || []}
                  currentMembers={item.membersCount || 0}
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
            />
          )}
        </>
      ),
      snapPoint: 'full',
      onClose: () => {
        if (!selectedGroup) {
          setSelectedPrivacy(
            privacyOptions.find(
              option => option.value === GroupPrivacy.PUBLIC,
            ) || null,
          );
        }
      },
    });
  };

  const handleSelectImage = async () => {
    if (selectedImages.length >= 3) {
      showToast({
        type: 'error',
        text1: t('screens.post.limit_reached'),
        text2: t('screens.post.max_images_message'),
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
            text1: t('screens.post.file_too_large'),
            text2: t('screens.post.image_size_limit'),
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
        text1: t('common.error'),
        text2: t('screens.accountSetup.failed_to_select_image'),
      });
    }
  };

  const handleRemoveImage = (id: number) => {
    setSelectedImages(selectedImages.filter(image => image.id !== id));
  };

  const handleAddLocation = () => {
    // Open bottom sheet with map
    openBottomSheet({
      title: t('screens.post.select_location'),
      content: (
        <SelectLocationMap
          initialAddress={location[0]}
          addressType={AddressType.POST_LOCATION}
          onLocationSelect={selectedLocation => {
            setLocation(selectedLocation);
            closeBottomSheet();
          }}
          onClose={() => {
            setLocation([]);
            closeBottomSheet();
          }}
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
        text1: t('common.error'),
        text2: t('screens.post.enter_content'),
      });
      return;
    }

    try {
      // Use base64 encoded images if available, otherwise fall back to URIs
      const imageData = selectedImages.map(img => img.base64 || img.uri);

      // Create update post input data
      const updatePostInput = {
        id: postId,
        content: postText.trim(),
        images: imageData.length > 0 ? imageData : null,
        addresses: location.length > 0 ? location : null,
        ...(selectedPrivacy?.value === GroupPrivacy.PRIVATE && selectedGroup
          ? {groupId: selectedGroup.id}
          : {groupId: null}),
      };

      // Call the updatePost function from the hook
      await updatePost(updatePostInput);

      // Toast is handled by the hook's onSuccess callback
    } catch (error) {
      loggingService.error('Error updating post:', error);
      // Error toast is already handled by the hook
    }
  };

  if (loadingPost) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.post.edit_post')}
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
              source={
                user?.avatar
                  ? {uri: user?.avatar}
                  : require('@assets/images/default_avatar.png')
              }
              style={styles.avatar as ImageStyle}
            />
            <View style={styles.profileInfo}>
              <Subtitle style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Subtitle>
              <Dropdown
                data={privacyOptions}
                placeholder={t('screens.post.select_privacy')}
                onSelect={handlePrivacyChange}
                showClearButton={false}
                selectedItem={selectedPrivacy}
                containerStyle={styles.privacySelector}
                inputStyle={styles.privacyInput}
              />

              {selectedPrivacy?.value === GroupPrivacy.PRIVATE &&
                selectedGroup && (
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
            placeholder={t('screens.post.what_do_you_want_to_write')}
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
                location.length > 0
                  ? location.find(
                      address => address.language.toLowerCase() === language,
                    )?.address
                  : t('screens.post.add_location')
              }
            />
          </View>
        </ScrollView>
      </SafeAreaView>
      {/* Update Button */}
      <View style={styles.postButtonContainer}>
        <Button
          variant="dark"
          size="medium"
          shape="round"
          onPress={handleUpdate}
          title={t('common.submit')}
          loading={isLoading}
          disabled={
            isLoading ||
            !postText.trim() ||
            (selectedPrivacy?.value === GroupPrivacy.PRIVATE && !selectedGroup)
          }
        />
      </View>
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
    borderBottomColor: colors.secondary.main,
  },
  profileSection: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.neutral.black,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
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
