import React, {useState, useEffect, useCallback, useRef} from 'react';
import {View, StyleSheet, ScrollView, FlatList} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from '@navigation/types/navigationTypes';
import {colors, getShadow, spacing} from '@theme';
import {
  Typography,
  FeedCard,
  CommentItem,
  CommentInput,
  TopHeaderBar,
  showToast,
  Body,
  SwipeableItem,
  Icon,
  Dialog,
  SkeletonGroup,
} from '@components';
import {IComment, IPost} from '@motorove/shared';
import {Comment} from '@components/Comment/comments';
import {
  useCreateComment,
  useGetPost,
  useUpdateComment,
  useRemoveComment,
} from '@services';
import {useAuth} from '@contexts/AuthContext';
import {IconName} from '@components/Icon';
import {relativeTime} from '@utils/dateUtils';
import {useTranslation} from '@hooks/useTranslation';
import {useLanguage} from '@contexts/LanguageContext';

type Props = NativeStackScreenProps<MainStackParamList, 'Comment'>;

// Using the Comment interface from components
export const CommentScreen = ({navigation, route: {params}}: Props) => {
  const {t} = useTranslation();
  const {language} = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [editingComment, setEditingComment] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const commentToDelete = useRef<{id: string; postId: string} | null>(null);

  // Get current user
  const {user} = useAuth();

  // Get post data
  const {
    post,
    loading: postLoading,
    error: postError,
    refetch: refetchPost,
  } = useGetPost(params.postId);

  // Mutations for comments
  const {createComment, loading: createLoading} = useCreateComment(() => {
    // Refetch comments after creating a new one
    refetchPost();
  });

  const {updateComment, loading: updateLoading} = useUpdateComment(() => {
    // Refetch comments after updating
    refetchPost();
    // Reset editing state
    setEditingComment(null);
  });

  const {removeComment, loading: removeLoading} = useRemoveComment(() => {
    // Refetch comments after removing
    refetchPost();
  });

  useEffect(() => {
    // Check for errors
    if (postError) {
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load post. Please try again.',
      });
    }
  }, [postError]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchPost();
    } finally {
      setRefreshing(false);
    }
  }, [refetchPost]);

  const handleEditComment = (comment: Comment) => {
    setEditingComment({
      id: comment.id,
      content: comment.content,
    });
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
  };

  const handleDeleteComment = (commentId: string, postId: string) => {
    commentToDelete.current = {id: commentId, postId};
    setDeleteDialogVisible(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete.current) {
      return;
    }

    try {
      await removeComment(
        commentToDelete.current.id,
        commentToDelete.current.postId,
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleSubmitComment = async (text: string) => {
    if (!text.trim()) {
      return;
    }

    // If editing a comment
    if (editingComment) {
      try {
        await updateComment({
          id: editingComment.id,
          content: text,
        });
      } catch (error) {
        console.error('Error updating comment:', error);
      }
      return;
    }

    // Creating a new comment
    try {
      await createComment({
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
          icon: 'map-pin' as IconName,
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
          ? postData.images.map((img: string) => ({uri: img}))
          : undefined;

      return {
        id: postData.id,
        userName: `${postData.createdBy.firstName} ${postData.createdBy.lastName}`,
        avatarSource: formatAvatarSource(postData.createdBy.avatar),
        timeAgo: relativeTime(postData.createdAt, t),
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
          userName={feedCardProps.userName}
          timeAgo={feedCardProps.timeAgo}
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
    [user, transformPostToFeedCard],
  );

  const mapCommentForUI = (comment: IComment): Comment => {
    const userName = comment.createdBy?.firstName
      ? `${comment.createdBy.firstName} ${comment.createdBy.lastName || ''}`
      : 'Unknown User';

    return {
      id: comment.id,
      userId: comment.createdBy?.id || '',
      userName: userName.trim(),
      avatarSource: formatAvatarSource(comment.createdBy?.avatar),
      content: comment.content,
      timeAgo: relativeTime(comment.createdAt, t),
      likeCount: 0,
      replyCount: 0, // Adding required property
      isLiked: false,
    };
  };

  const isCommentOwner = (comment: Comment): boolean => {
    return user?.id === comment.userId;
  };

  const renderCommentWithSwipeable = useCallback(
    (commentItem: Comment, style: any = {}) => {
      const isOwner = isCommentOwner(commentItem);

      // If user is not the owner, render regular comment without swipeable
      if (!isOwner) {
        return (
          <CommentItem
            comment={commentItem}
            style={style}
            actionBarActive={false}
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
              onPress: () => handleEditComment(commentItem),
            },
            {
              text: t('common.delete'),
              icon: (
                <Icon name="trash" color={colors.neutral.white} size={20} />
              ),
              backgroundColor: colors.status.error,
              onPress: () => handleDeleteComment(commentItem.id, params.postId),
            },
          ]}
          contentContainerStyle={styles.swipeableContainer}>
          <CommentItem
            comment={commentItem}
            style={style}
            actionBarActive={false}
          />
        </SwipeableItem>
      );
    },
    [handleEditComment, handleDeleteComment, isCommentOwner, params.postId, t],
  );

  const renderItem = useCallback(
    ({item}: {item: IComment}) => {
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
          title={t('screens.post.comments')}
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
          {t('screens.post.post_not_found')}
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={`${t('screens.post.comments')} (${post?.comments?.length || 0})`}
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
            {t('screens.post.no_comments_yet')}{' '}
          </Body>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      <CommentInput
        onSubmit={handleSubmitComment}
        isLoading={createLoading || updateLoading || removeLoading}
        initialValue={editingComment?.content || ''}
        editing={Boolean(editingComment)}
        onCancelEdit={handleCancelEdit}
      />

      <Dialog
        variant="confirm"
        visible={deleteDialogVisible}
        title={t('screens.post.delete_comment')}
        message={t('screens.post.delete_comment_confirmation')}
        confirmButton={{
          text: t('common.delete'),
          variant: 'primary',
          onPress: confirmDeleteComment,
        }}
        cancelButton={{
          text: t('common.cancel'),
          variant: 'outline',
        }}
        onClose={() => setDeleteDialogVisible(false)}
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
});
