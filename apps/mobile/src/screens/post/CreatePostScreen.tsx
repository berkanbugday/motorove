import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ImageStyle,
  TextStyle,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {radius} from '../../theme/radius';
import {typography} from '../../theme/typography';
import {Icon} from '../../components/Icon';
import {TopHeaderBar} from '@components/TopHeaderBar';
import {useAuth} from '@contexts/AuthContext';
import {SearchableDropdown, Subtitle} from '@components';

export const CreatePostScreen = () => {
  const navigation = useNavigation();
  const [postText, setPostText] = useState('');
  const [selectedImages] = useState([
    {id: 1, uri: 'https://example.com/beach-sunset.jpg'},
    {id: 2, uri: 'https://example.com/cafe.jpg'},
  ]);

  const {user} = useAuth();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handlePost = () => {
    // Implement post functionality
    console.log('Posting:', {text: postText, images: selectedImages});
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title="Create Post"
        showBackButton
        onBackPress={handleGoBack}
        containerStyle={styles.topHeaderBar}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView>
          {/* User Profile Section */}
          <View style={styles.profileSection}>
            <Image
              source={{uri: 'https://example.com/profile-avatar.jpg'}}
              style={styles.avatar as ImageStyle}
            />
            <View style={styles.profileInfo}>
              <Subtitle style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Subtitle>
              <SearchableDropdown
                data={[
                  {id: 1, label: 'Public', value: 'public'},
                  {id: 2, label: 'Private', value: 'private'},
                ]}
                placeholder="Select privacy"
                onSelect={() => {}}
                searchable={false}
                containerStyle={styles.privacySelector}
              />
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedImages.map(image => (
                <View key={image.id}>
                  <Image
                    source={{uri: image.uri}}
                    style={styles.postImage as ImageStyle}
                  />
                </View>
              ))}
              <TouchableOpacity style={styles.addImageButton}>
                <Icon name="plus" size={24} color={colors.neutral.grey} />
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="map-pin" size={20} color={colors.neutral.black} />
              <Text style={styles.actionButtonText}>Add location</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Icon name="route" size={20} color={colors.neutral.black} />
              <Text style={styles.actionButtonText}>Add route</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Icon name="users" size={20} color={colors.neutral.black} />
              <Text style={styles.actionButtonText}>Tag people</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Post Button */}
        <View style={styles.postButtonContainer}>
          <TouchableOpacity style={styles.postButton} onPress={handlePost}>
            <Text style={styles.postButtonText as TextStyle}>Post</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    padding: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    width: '60%',
  },
  privacyText: {
    ...(typography.bodySmall as TextStyle),
    marginRight: spacing.xs,
    color: colors.neutral.black,
  },
  postInput: {
    ...(typography.body as TextStyle),
    color: colors.neutral.black,
    padding: spacing.md,
    maxHeight: 200,
    textAlignVertical: 'top',
  },
  imagesContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
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
  actionButtonsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.light,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  actionButtonText: {
    ...(typography.bodySmall as TextStyle),
    color: colors.neutral.black,
    marginLeft: spacing.sm,
  },
  postButtonContainer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.light,
  },
  postButton: {
    backgroundColor: colors.neutral.black,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  postButtonText: {
    ...(typography.buttonText as TextStyle),
    color: colors.neutral.white,
  },
});
