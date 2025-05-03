import React, {useState} from 'react';
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
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {radius} from '../../theme/radius';
import {typography} from '../../theme/typography';
import {Icon} from '../../components/Icon';
import {TopHeaderBar} from '@components/TopHeaderBar';
import {useAuth} from '@contexts/AuthContext';
import {Button, Chip, DropdownItem, Dropdown, Subtitle} from '@components';
import {launchImageLibrary} from 'react-native-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
export const CreatePostScreen = () => {
  const navigation = useNavigation();
  const [postText, setPostText] = useState('');
  const [selectedPrivacy, setSelectedPrivacy] = useState<DropdownItem | null>(
    null,
  );
  const [selectedImages, setSelectedImages] = useState<
    {id: number; uri: string}[]
  >([]);
  const {user} = useAuth();
  const insets = useSafeAreaInsets();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handlePost = () => {
    // Implement post functionality
    console.log('Posting:', {text: postText, images: selectedImages});
    navigation.goBack();
  };

  const handleSelectImage = async () => {
    if (selectedImages.length >= 3) {
      Alert.alert('Limit Reached', 'You can select a maximum of 3 images');
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.assets && result.assets.length > 0) {
        const newImage = {
          id: Date.now(),
          uri: result.assets[0].uri || '',
        };
        setSelectedImages([...selectedImages, newImage]);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  const handleRemoveImage = (id: number) => {
    setSelectedImages(selectedImages.filter(image => image.id !== id));
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title="Create Post"
        showBackButton
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
                onSelect={item => setSelectedPrivacy(item)}
                searchable={false}
                selectedItem={selectedPrivacy}
                containerStyle={styles.privacySelector}
                inputStyle={styles.privacyInput}
              />

              {selectedPrivacy?.value === 'group' && (
                <Chip
                  label="IMG Motorcycle Group"
                  leadingIcon="users"
                  size="small"
                  variant="filled"
                  color="secondary"
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
            {/* <TouchableOpacity style={styles.actionButton}>
              <Icon name="map-pin" size={20} color={colors.neutral.black} />
              <Text style={styles.actionButtonText}>Add location</Text>
            </TouchableOpacity> */}
            <Button
              variant="text"
              iconName="map-pin"
              iconColor={colors.neutral.black}
              iconSize={18}
              onPress={() => {}}
              textStyle={styles.actionButtonText}
              title="Add location"
            />
            <Button
              variant="text"
              iconName="route"
              iconColor={colors.neutral.black}
              iconSize={18}
              onPress={() => {}}
              textStyle={styles.actionButtonText}
              title="Add route"
            />

            <Button
              variant="text"
              iconName="users"
              iconColor={colors.neutral.black}
              iconSize={18}
              onPress={() => {}}
              textStyle={styles.actionButtonText}
              title="Tag people"
            />
          </View>
        </ScrollView>

        {/* Post Button */}
        <View style={styles.postButtonContainer}>
          <Button
            variant="dark"
            size="medium"
            shape="round"
            onPress={handlePost}
            title="Post"
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
  topHeaderBar: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
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
    height: 200,
    textAlignVertical: 'top',
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
    backgroundColor: colors.primary.main,
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
    borderTopWidth: 1,
    borderTopColor: colors.secondary.light,
  },
});
