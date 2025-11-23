import React, {useState, useEffect, useCallback, useRef} from 'react';
import {View, StyleSheet, ScrollView, FlatList} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from '@navigation/types/navigationTypes';
import {colors, getShadow, spacing} from '@theme';
import {
  Typography,
  FeedCard,
  PostCommentItem,
  PostCommentInput,
  TopHeaderBar,
  showToast,
  Body,
  SwipeableItem,
  Icon,
  SkeletonGroup,
  Button,
  LoadingIndicator,
} from '@components';
import {IPostComment, IImage, IPost, Language} from '@motorove/shared';
import {PostComment} from '@components/PostComment/post-comment.interface';
import {
  useCreatePostComment,
  useGetPost,
  useUpdatePostComment,
  useRemovePostComment,
} from '@services';
import {useAuth} from '@contexts/AuthContext';
import {IconName} from '@components/Icon';
import {formatDistanceToNow} from 'date-fns';
import {tr, enUS} from 'date-fns/locale';
import {useTranslation} from '@hooks/useTranslation';
import {useLanguage} from '@contexts/LanguageContext';
import {
  closeBottomSheet,
  useBottomSheet,
} from '@components/BottomSheet/BottomSheetProvider';

type Props = NativeStackScreenProps<MainStackParamList, 'PostComment'>;

// Using the PostComment interface from components
export const PostCommentScreen = ({navigation, route: {params}}: Props) => {
  const {t} = useTranslation();
  const {language} = useLanguage();
  const {openBottomSheet} = useBottomSheet();
  const [refreshing, setRefreshing] = useState(false);
  const [editingComment, setEditingComment] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const commentToDelete = useRef<{id: string; postId: string} | null>(null);

  // Get current user
  const {id: currentUserId} = useAuth();

  // Get post data
  const {
    post,
    loading: postLoading,
    error: postError,
    refetch: refetchPost,
  } = useGetPost(params.postId);

  // Mutations for post comments
  const {createPostComment, loading: createLoading} = useCreatePostComment(
    () => {
      // Refetch post comments after creating a new one
      refetchPost();
    },
  );

  const {updatePostComment, loading: updateLoading} = useUpdatePostComment(
    () => {
      // Refetch post comments after updating
      refetchPost();
      // Reset editing state
      setEditingComment(null);
    },
  );

  const {removePostComment, loading: removeLoading} = useRemovePostComment(
    () => {
      // Refetch post comments after removing
      refetchPost();
    },
  );

  useEffect(() => {
    // Check for errors
    if (postError) {
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('errors.api.failed_to_load_post'),
      });
    }
  }, [postError, t]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchPost();
    } finally {
      setRefreshing(false);
    }
  }, [refetchPost]);

  const handleEditPostComment = (comment: PostComment) => {
    setEditingComment({
      id: comment.id,
      content: comment.content,
    });
  };

  const handleCancelEditPostComment = () => {
    setEditingComment(null);
  };

  const handleDeletePostComment = (commentId: string, postId: string) => {
    commentToDelete.current = {id: commentId, postId};
    openBottomSheet({
      title: t('screens.postComment.delete_comment'),
      showCloseButton: false,
      enableGestureControl: false,
      content: (
        <View style={styles.bottomSheetContent}>
          <Body style={styles.bottomSheetMessage}>
            {t('screens.postComment.delete_comment_confirmation')}
          </Body>

          <View style={styles.bottomSheetButtons}>
            <Button
              title={t('common.cancel')}
              variant="outline"
              shape="round"
              onPress={() => closeBottomSheet()}
              style={styles.bottomSheetButton}
            />
            <Button
              title={t('common.delete')}
              variant="primary"
              shape="round"
              onPress={() => {
                confirmDeletePostComment();
                closeBottomSheet();
              }}
              style={styles.bottomSheetButton}
            />
          </View>
        </View>
      ),
      snapPoint: 'minimal',
    });
  };

  const confirmDeletePostComment = async () => {
    if (!commentToDelete.current) {
      return;
    }

    try {
      await removePostComment(
        commentToDelete.current.id,
        commentToDelete.current.postId,
      );
    } catch (error) {
      console.error('Error deleting post comment:', error);
    }
  };

  const handleSubmitPostComment = async (text: string) => {
    if (!text.trim()) {
      return;
    }

    // If editing a comment
    if (editingComment) {
      try {
        await updatePostComment({
          id: editingComment.id,
          content: text,
        });
      } catch (error) {
        console.error('Error updating post comment:', error);
      }
      return;
    }

    // Creating a new comment
    try {
      await createPostComment({
        content: text,
        postId: params.postId,
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  // Helper function to format avatar URL from API data
  const formatAvatarSource = useCallback((imageUrl?: string) => {
    return imageUrl
      ? {uri: imageUrl}
      : require('../../assets/images/default_avatar.png');
  }, []);

  // Transform Post model to FeedCard props
  const transformPostToFeedCard = useCallback(
    (postData: IPost) => {
      // Create labels from post data
      const labels = [];

      if (postData.groupId) {
        labels.push({
          icon: 'users-filled' as IconName,
          text: postData.groupName || '',
        });
      }

      if (postData.addresses && postData.addresses.length > 0) {
        labels.push({
          icon: 'map-pin-filled' as IconName,
          text:
            postData.addresses?.find(
              address =>
                address.language.toLowerCase() === language.toLowerCase(),
            )?.address || '',
        });
      }

      // Transform images from string URLs to objects with URI
      const images =
        postData.images && postData.images.length > 0
          ? postData.images.map((img: IImage) => ({
              url: img.url,
              isCensored: img.isCensored,
              order: img.order,
            }))
          : undefined;

      return {
        id: postData.id,
        fullName: `${postData.createdBy.firstName} ${postData.createdBy.lastName}`,
        avatarSource: formatAvatarSource(postData.createdBy.avatar),
        createdAt: postData.createdAt,
        content: postData.content,
        images,
        likeCount: postData.likesCount,
        commentCount: postData.commentsCount,
        isSaved: postData.isSaved,
        isLiked: postData.isLiked,
        isCommented: false, // This might not be available in the API
        labels,
      };
    },
    [formatAvatarSource, navigation, t],
  );

  // Render feed post with comment navigation and dropdown menu
  const renderFeedPost = useCallback(
    (item: IPost) => {
      // Transform Post model to FeedCard props
      const feedCardProps = transformPostToFeedCard(item);

      return (
        <FeedCard
          avatarSource={feedCardProps.avatarSource}
          fullName={feedCardProps.fullName}
          createdAt={feedCardProps.createdAt}
          labels={feedCardProps.labels}
          content={feedCardProps.content}
          images={feedCardProps.images}
          likeCount={feedCardProps.likeCount}
          commentCount={feedCardProps.commentCount}
          isSaved={feedCardProps.isSaved}
          isLiked={feedCardProps.isLiked}
          isCommented={feedCardProps.isCommented}
          actionBarDisabled
          style={styles.feedCard}
        />
      );
    },
    [currentUserId, transformPostToFeedCard],
  );

  const mapCommentForUI = (comment: IPostComment): PostComment => {
    const fullName = comment.createdBy?.firstName
      ? `${comment.createdBy.firstName} ${comment.createdBy.lastName || ''}`
      : 'Unknown User';

    return {
      id: comment.id,
      userId: comment.createdBy?.id || '',
      fullName: fullName.trim(),
      avatarSource: formatAvatarSource(comment.createdBy?.avatar),
      content: comment.content,
      timeAgo: formatDistanceToNow(new Date(comment.createdAt), {
        addSuffix: true,
        locale:
          language.toLowerCase() === Language.TR.toLowerCase() ? tr : enUS,
      }),
      likeCount: 0,
      replyCount: 0, // Adding required property
      isLiked: false,
    };
  };

  const isCommentOwner = (comment: PostComment): boolean => {
    return currentUserId === comment.userId;
  };

  const renderCommentWithSwipeable = useCallback(
    (commentItem: PostComment, style: any = {}) => {
      const isOwner = isCommentOwner(commentItem);

      // If user is not the owner, render regular comment without swipeable
      if (!isOwner) {
        return (
          <PostCommentItem
            comment={commentItem}
            style={style}
            actionBarActive={false}
            onPressAvatar={() => {
              if (commentItem.userId !== currentUserId) {
                navigation.navigate('Profile', {userId: commentItem.userId});
              }
            }}
          />
        );
      }

      // For comment owners, render with swipeable actions
      return (
        <SwipeableItem
          rightActions={[
            {
              text: t('common.edit'),
              icon: <Icon name="pen" color={colors.neutral.white} size={20} />,
              backgroundColor: colors.status.success,
              onPress: () => handleEditPostComment(commentItem),
            },
            {
              text: t('common.delete'),
              icon: (
                <Icon name="trash" color={colors.neutral.white} size={20} />
              ),
              backgroundColor: colors.status.error,
              onPress: () =>
                handleDeletePostComment(commentItem.id, params.postId),
            },
          ]}
          contentContainerStyle={styles.swipeableContainer}>
          <PostCommentItem
            comment={commentItem}
            style={style}
            actionBarActive={false}
          />
        </SwipeableItem>
      );
    },
    [
      handleEditPostComment,
      handleDeletePostComment,
      isCommentOwner,
      params.postId,
      t,
    ],
  );

  const renderItem = useCallback(
    ({item}: {item: IPostComment}) => {
      const isLastComment =
        item.id === post?.comments?.[post.comments.length - 1]?.id;
      const mappedComment = mapCommentForUI(item);

      return (
        <View style={[isLastComment && {marginBottom: spacing.xxxl}]}>
          {renderCommentWithSwipeable(mappedComment)}
        </View>
      );
    },
    [post, renderCommentWithSwipeable, mapCommentForUI, t],
  );

  // Render skeleton loaders when loading
  if (postLoading) {
    return (
      <View style={styles.container}>
        <TopHeaderBar
          title={t('screens.postComment.comments')}
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <ScrollView
          style={styles.listContent}
          showsVerticalScrollIndicator={false}>
          {/* Post skeleton */}
          <SkeletonGroup
            preset="post"
            lines={2}
            showAvatar
            showImage
            showFooter
            style={styles.skeletonPost}
          />

          {/* Comment skeletons */}
          {[...Array(3)].map((_, i) => (
            <SkeletonGroup
              key={`comment-skeleton-${i}`}
              preset="comment"
              backgroundColor={colors.secondary.light}
              lines={1}
              showAvatar
              showShadow={false}
              style={styles.skeletonComment}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, styles.center]}>
        <Typography variant="subtitle">
          {t('screens.postComment.post_not_found')}
        </Typography>
        <Button
          shape="round"
          variant="primary"
          title={t('common.back')}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={`${t('screens.postComment.comments')} (${
          post?.comments?.length || 0
        })`}
        showBackButton
        showShadow={false}
        onBackPress={() => navigation.goBack()}
        containerStyle={styles.topHeaderBar}
      />

      <FlatList
        data={post?.comments}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderFeedPost(post)}
        ListEmptyComponent={
          <Body color="grey" align="center" style={{marginTop: spacing.xxxl}}>
            {t('screens.postComment.no_comments_yet')}{' '}
          </Body>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      <PostCommentInput
        onSubmit={handleSubmitPostComment}
        isLoading={createLoading || updateLoading || removeLoading}
        initialValue={editingComment?.content || ''}
        editing={Boolean(editingComment)}
        onCancelEdit={handleCancelEditPostComment}
      />
      <LoadingIndicator
        visible={createLoading || updateLoading || removeLoading}
      />
    </View>
  );
};

// Define styles at the top to avoid 'used before declaration' errors
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  topHeaderBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.md,
  },
  swipeableContainer: {
    backgroundColor: colors.neutral.white,
  },
  skeletonPost: {
    marginBottom: spacing.md,
  },
  skeletonComment: {
    marginBottom: spacing.sm,
  },
  feedCard: {
    ...getShadow('none'),
    borderBottomWidth: 1,
    borderRadius: 0,
    borderBottomColor: colors.secondary.main,
  },
  bottomSheetContent: {
    padding: spacing.md,
  },
  bottomSheetMessage: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  bottomSheetButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  bottomSheetButton: {
    flex: 1,
    width: '50%',
  },
  backButton: {
    marginTop: spacing.md,
  },
});
