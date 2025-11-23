import {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {IPost, IImage} from '@motorove/shared';
import {useLanguage} from '@contexts';
import {
  useGetPosts,
  useLikePost,
  useUnlikePost,
  useSavePost,
  useUnsavePost,
  useRemovePost,
} from '@services/post.service';
import {IconName} from '@components';
import {navigateToScreen} from '@navigation/utils/navigationHelpers';
import {
  openBottomSheet,
  closeBottomSheet,
} from '@components/BottomSheet/BottomSheetProvider';
import {useTranslation} from '@hooks/useTranslation';
import {useAuth} from '@contexts';
import {IUser} from '@motorove/shared';
import {DropdownMenuItem} from '@components/DropdownMenu';
import {FlatList, View} from 'react-native';
import {Body, Button} from '@components';
import {spacing} from '@theme';

type UseGroupPostsProps = {
  groupId: string;
};

/**
 * Hook to handle group posts interactions
 */
export const useGroupPosts = ({groupId}: UseGroupPostsProps) => {
  const {t} = useTranslation();
  const {id: currentUserId} = useAuth();
  const {language} = useLanguage();
  const navigation = useNavigation<MainScreenNavigationProp<'GroupDetail'>>();

  const {
    posts,
    loading: postsLoading,
    refetch: refetchPosts,
  } = useGetPosts(groupId);

  const {likePost} = useLikePost();
  const {unlikePost} = useUnlikePost();
  const {savePost} = useSavePost();
  const {unsavePost} = useUnsavePost();
  const {removePost} = useRemovePost(() => {
    refetchPosts();
  });

  const formatAvatarSource = useCallback((imageUrl?: string) => {
    return imageUrl
      ? {uri: imageUrl}
      : require('@assets/images/default_avatar.png');
  }, []);

  const transformPostToFeedCard = useCallback(
    (post: IPost) => {
      const labels = [];

      if (post.addresses && post.addresses.length > 0) {
        labels.push({
          icon: 'map-pin-filled' as IconName,
          text:
            post.addresses?.find(
              address =>
                address.language.toLowerCase() === language.toLowerCase(),
            )?.address || '',
        });
      }

      const images =
        post.images && post.images.length > 0
          ? post.images.map((img: IImage) => ({
              url: img.url,
              isCensored: img.isCensored,
              order: img.order,
            }))
          : undefined;

      return {
        id: post.id,
        fullName: `${post.createdBy.firstName} ${post.createdBy.lastName}`,
        avatarSource: formatAvatarSource(post.createdBy.avatar),
        createdAt: post.createdAt,
        content: post.content,
        images,
        likeCount: post.likesCount,
        commentCount: post.commentsCount,
        isSaved: post.isSaved,
        isLiked: post.isLiked,
        isCommented: false,
        labels,
      };
    },
    [language, formatAvatarSource],
  );

  const handleLikePress = useCallback(
    async (postId: string, isLiked: boolean) => {
      if (isLiked) {
        unlikePost(postId);
      } else {
        likePost(postId);
      }
    },
    [likePost, unlikePost],
  );

  const handleCommentPress = useCallback(
    (postId: string) => {
      navigateToScreen(navigation, 'PostComment', {postId});
    },
    [navigation],
  );

  const handleSavePress = useCallback(
    async (postId: string, isSaved: boolean) => {
      if (isSaved) {
        unsavePost(postId);
      } else {
        savePost(postId);
      }
    },
    [savePost, unsavePost],
  );

  const renderUserItem = useCallback(({item}: {item: IUser}) => {
    return (
      <View style={{padding: spacing.md}}>
        <Body>
          {item.firstName} {item.lastName}
        </Body>
      </View>
    );
  }, []);

  const handleLikesPress = useCallback(
    (likedUsers?: IUser[]) => {
      if (likedUsers) {
        const sortedUsers = [...likedUsers].sort((a, b) => {
          if (a.id === currentUserId) {
            return -1;
          }
          if (b.id === currentUserId) {
            return 1;
          }
          return 0;
        });

        openBottomSheet({
          content: (
            <FlatList
              data={sortedUsers}
              renderItem={renderUserItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={{padding: 20, alignItems: 'center'}}>
                  <Body>{t('screens.home.no_likes_yet')}</Body>
                </View>
              }
            />
          ),
        });
      }
    },
    [currentUserId, renderUserItem, t],
  );

  const createPostDropdownItems = useCallback(
    (postId: string, isOwnPost: boolean): DropdownMenuItem[] => {
      const items: DropdownMenuItem[] = [];

      if (isOwnPost) {
        items.unshift(
          {
            id: 'edit',
            label: t('common.edit'),
            icon: 'pen',
          },
          {
            id: 'delete',
            label: t('common.delete'),
            icon: 'trash',
            isHighlighted: true,
          },
        );
      }

      return items;
    },
    [t],
  );

  const handlePostDropdownSelect = useCallback(
    (item: DropdownMenuItem, postId: string) => {
      switch (item.id) {
        case 'edit':
          navigateToScreen(navigation, 'EditPost', {postId});
          break;
        case 'delete':
          openBottomSheet({
            title: t('screens.post.delete_post'),
            closeButtonPosition: 'top-right',
            enableGestureControl: false,
            content: (
              <View>
                <Body>{t('screens.post.delete_post_confirmation')}</Body>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: spacing.md,
                    paddingTop: spacing.lg,
                    paddingBottom: spacing.lg,
                  }}>
                  <Button
                    title={t('common.cancel')}
                    variant="outline"
                    onPress={() => closeBottomSheet()}
                    style={{width: '50%'}}
                  />
                  <Button
                    title={t('common.delete')}
                    variant="primary"
                    onPress={() => {
                      removePost(postId);
                      closeBottomSheet();
                    }}
                    style={{width: '50%'}}
                  />
                </View>
              </View>
            ),
            snapPoint: 'minimal',
          });
          break;
        default:
          break;
      }
    },
    [navigation, removePost, t],
  );

  return {
    posts,
    postsLoading,
    refetchPosts,
    transformPostToFeedCard,
    handleLikePress,
    handleCommentPress,
    handleSavePress,
    handleLikesPress,
    createPostDropdownItems,
    handlePostDropdownSelect,
  };
};
