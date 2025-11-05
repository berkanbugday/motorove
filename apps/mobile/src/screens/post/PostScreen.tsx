import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  TopHeaderBar,
  Button,
  Tabs,
  FeedCard,
  Body,
  SkeletonGroup,
  UserCard,
} from '@components';
import {colors, spacing} from '@theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {IconName} from '@components/Icon';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from '@navigation/types/navigationTypes';
import {navigateToScreen} from '@navigation/utils/navigationHelpers';
import {DropdownMenuItem} from '@components/DropdownMenu';
import {loggingService} from '@services/logging.service';
import {useAuth} from '@contexts/AuthContext';
import {useLanguage} from '@contexts/LanguageContext';
import {
  closeBottomSheet,
  useBottomSheet,
} from '@components/BottomSheet/BottomSheetProvider';
import {IPost, IUser, IImage, Language} from '@motorove/shared';
import {
  useGetPosts,
  useLikePost,
  useUnlikePost,
  useSavePost,
  useUnsavePost,
  useRemovePost,
} from '@services/post.service';
import {formatDistanceToNow} from 'date-fns';
import {tr, enUS} from 'date-fns/locale';
import {useTranslation} from '@hooks/useTranslation';
import {useFocusEffect} from '@react-navigation/native';

type Props = NativeStackScreenProps<MainStackParamList, 'Posts'>;

export const PostScreen = ({navigation}: Props) => {
  const {t} = useTranslation();
  const [activeTab, setActiveTab] = useState('shared_posts');
  const [refreshing, setRefreshing] = useState(false);
  const {user} = useAuth();
  const {language} = useLanguage();
  const {openBottomSheet} = useBottomSheet();
  const insets = useSafeAreaInsets();

  // Hook for user's posts (My Posts tab)
  const {
    posts: myPosts,
    loading: myPostsLoading,
    refetch: refetchMyPosts,
    loadMore: loadMoreMyPosts,
  } = useGetPosts(undefined, user?.id);

  // Hook for saved posts (Saved Posts tab)
  const {
    posts: savedPosts,
    loading: savedPostsLoading,
    refetch: refetchSavedPosts,
    loadMore: loadMoreSavedPosts,
  } = useGetPosts(undefined, undefined, user?.id);

  // Add hooks for post interactions
  const {likePost} = useLikePost();
  const {unlikePost} = useUnlikePost();
  const {savePost} = useSavePost();
  const {unsavePost} = useUnsavePost();

  // Add hook for post deletion
  const {removePost} = useRemovePost(() => {
    if (activeTab === 'shared_posts') {
      refetchMyPosts();
    } else {
      refetchSavedPosts();
    }
  });

  // Refetch posts when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'shared_posts') {
        refetchMyPosts();
      } else {
        refetchSavedPosts();
      }
    }, [activeTab, refetchMyPosts, refetchSavedPosts]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'shared_posts') {
        await refetchMyPosts();
      } else {
        await refetchSavedPosts();
      }
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, refetchMyPosts, refetchSavedPosts]);

  // Handle navigation to comment details
  const handleCommentPress = (postId: string) => {
    navigateToScreen(navigation, 'PostComment', {postId});
  };

  // Handle like press with API call - using optimistic updates
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

  // Handle save press with API call - using optimistic updates
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

  // Create dropdown menu items for the feed posts
  const createPostDropdownItems = useCallback(
    (postId: string, isOwnPost: boolean): DropdownMenuItem[] => {
      const items: DropdownMenuItem[] = [];

      // Add edit and delete options if it's the user's own post
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

  // Render each user item in likes bottom sheet
  const renderUserItem = useCallback(
    ({item}: {item: IUser}) => {
      return (
        <UserCard
          user={item}
          onPress={() => {
            if (item.id !== user?.id) {
              closeBottomSheet();
              navigateToScreen(navigation, 'Profile', {userId: item.id});
            }
          }}
          showFollowButton={false}
          showUnfollowButton={false}
        />
      );
    },
    [navigation, user?.id],
  );

  // Show liked users in bottom sheet with current user first
  const handleLikesPress = useCallback(
    (likedUsers?: IUser[]) => {
      if (likedUsers) {
        // Sort the array to put current user first
        const sortedUsers = [...likedUsers].sort((a, b) => {
          if (a.id === user?.id) {
            return -1;
          }
          if (b.id === user?.id) {
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
    [user?.id, openBottomSheet, renderUserItem, t],
  );

  // Handle dropdown menu item selection
  const handleDropdownSelect = useCallback(
    (item: DropdownMenuItem, postId: string) => {
      switch (item.id) {
        case 'edit':
          navigateToScreen(navigation, 'EditPost', {postId});
          break;
        case 'delete':
          // Show confirmation dialog before deleting
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
          loggingService.info(
            `Unhandled action: ${item.id} for post: ${postId}`,
          );
      }
    },
    [navigation, removePost, openBottomSheet, t],
  );

  // Helper function to format avatar URL from API data
  const formatAvatarSource = useCallback((imageUrl?: string) => {
    return imageUrl
      ? {uri: imageUrl}
      : require('../../assets/images/default_avatar.png');
  }, []);

  // Transform Post model to FeedCard props
  const transformPostToFeedCard = useCallback(
    (post: IPost) => {
      // Create labels from post data
      const labels = [];

      if (post.groupId) {
        labels.push({
          icon: 'users-filled' as IconName,
          text: post.groupName || '',
        });
      }

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

      // Transform images from string URLs to objects with URI
      const images =
        post.images && post.images.length > 0
          ? post.images.map((img: IImage) => ({
              url: img.url,
              isCensored: img.isCensored,
            }))
          : undefined;

      return {
        id: post.id,
        fullName: `${post.createdBy.firstName} ${post.createdBy.lastName}`,
        avatarSource: formatAvatarSource(post.createdBy.avatar),
        timeAgo: formatDistanceToNow(new Date(post.createdAt), {
          addSuffix: true,
          locale:
            language.toLowerCase() === Language.TR.toLowerCase() ? tr : enUS,
        }),
        content: post.content,
        images,
        likeCount: post.likesCount,
        commentCount: post.commentsCount,
        isSaved: post.isSaved,
        isLiked: post.isLiked,
        isCommented: false, // This might not be available in the API
        labels,
      };
    },
    [formatAvatarSource, language, t],
  );

  // Render feed post with comment navigation and dropdown menu
  const renderFeedPost = useCallback(
    ({item}: {item: IPost}) => {
      // Determine if this is the user's own post
      const isOwnPost = item.createdBy.id === user?.id;
      // Transform Post model to FeedCard props
      const feedCardProps = transformPostToFeedCard(item);

      return (
        <FeedCard
          avatarSource={feedCardProps.avatarSource}
          fullName={feedCardProps.fullName}
          timeAgo={feedCardProps.timeAgo}
          labels={feedCardProps.labels}
          content={feedCardProps.content}
          images={feedCardProps.images}
          likeCount={feedCardProps.likeCount}
          commentCount={feedCardProps.commentCount}
          isSaved={feedCardProps.isSaved}
          isLiked={feedCardProps.isLiked}
          isCommented={feedCardProps.isCommented}
          dropdownMenu={createPostDropdownItems(item.id, isOwnPost)}
          onDropdownSelect={menuItem => handleDropdownSelect(menuItem, item.id)}
          onLikePress={() => handleLikePress(item.id, item.isLiked)}
          onCommentPress={() => handleCommentPress(item.id)}
          onSavePress={() => handleSavePress(item.id, item.isSaved)}
          onLikesPress={() => handleLikesPress(item.likedUsers)}
          style={styles.feedCard}
        />
      );
    },
    [
      user,
      handleLikePress,
      handleSavePress,
      createPostDropdownItems,
      handleDropdownSelect,
      transformPostToFeedCard,
      handleLikesPress,
    ],
  );

  // Render My Posts tab
  const renderMyPostsTab = () => {
    if (myPostsLoading) {
      return (
        <View style={styles.skeletonListContainer}>
          <SkeletonGroup preset="post" />
          <SkeletonGroup preset="post" showImage={false} lines={1} />
          <SkeletonGroup preset="post" lines={2} />
        </View>
      );
    }

    return (
      <FlatList
        data={myPosts}
        renderItem={renderFeedPost}
        keyExtractor={(item: IPost) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.neutral.black]}
            tintColor={colors.neutral.black}
          />
        }
        contentContainerStyle={styles.listContent}
        onEndReached={loadMoreMyPosts}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Body>{t('screens.post.no_shared_posts_yet')}</Body>
          </View>
        }
      />
    );
  };

  // Render Saved Posts tab
  const renderSavedPostsTab = () => {
    if (savedPostsLoading) {
      return (
        <View style={styles.skeletonListContainer}>
          <SkeletonGroup preset="post" />
          <SkeletonGroup preset="post" showImage={false} lines={1} />
          <SkeletonGroup preset="post" lines={2} />
        </View>
      );
    }

    return (
      <FlatList
        data={savedPosts}
        renderItem={renderFeedPost}
        keyExtractor={(item: IPost) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.neutral.black]}
            tintColor={colors.neutral.black}
          />
        }
        contentContainerStyle={styles.listContent}
        onEndReached={loadMoreSavedPosts}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Body>{t('screens.post.no_favorites_yet')}</Body>
          </View>
        }
      />
    );
  };

  // Tab configuration for the Tabs component
  const tabItems = [
    {
      key: 'shared_posts',
      label: t('screens.post.shared_posts'),
      content: <View style={styles.tabContent}>{renderMyPostsTab()}</View>,
    },
    {
      key: 'favorites',
      label: t('screens.post.favorites'),
      content: <View style={styles.tabContent}>{renderSavedPostsTab()}</View>,
    },
  ];

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.menu.posts')}
        showShadow={false}
        containerStyle={styles.topHeaderBar}
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightIconName="plus"
        onRightButtonPress={() => navigation.navigate('CreatePost')}
      />
      <SafeAreaView style={[styles.container, {marginBottom: insets.bottom}]}>
        <View style={styles.contentContainer}>
          {/* Tab navigation for My Posts and Saved Posts */}
          <Tabs
            items={tabItems}
            selectedKey={activeTab}
            onTabChange={setActiveTab}
            variant="default"
            equalWidth
            contentContainerStyle={styles.tabContent}
            containerStyle={styles.tabContainer}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary.light,
  },
  topHeaderBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  contentContainer: {
    flex: 1,
  },
  tabContainer: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  tabContent: {
    flex: 1,
  },
  tabText: {
    fontWeight: 'bold',
  },
  tabIndicator: {
    backgroundColor: colors.primary.main,
    height: 3,
    borderRadius: 1.5,
  },
  sectionContainer: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  feedCard: {
    marginVertical: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonListContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
