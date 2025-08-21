import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from '@navigation/types/navigationTypes';
import {colors, spacing} from '@theme';
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
import {IComment} from '@motorove/shared';
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

type Props = NativeStackScreenProps<MainStackParamList, 'Comment'>;

// Comment interface for UI components
interface CommentUI {
  id: string;
  userId: string;
  userName: string;
  avatarSource: any;
  content: string;
  timeAgo: string;
  likeCount: number;
  replyCount: number;
  isLiked: boolean;
  parentId?: string;
}

// Define styles at the top to avoid 'used before declaration' errors
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  commentContainer: {
    marginBottom: spacing.md,
  },
  repliesContainer: {
    marginLeft: spacing.lg,
    marginTop: spacing.xs,
  },
  replyContainer: {
    marginBottom: spacing.xs,
  },
  replyWithBorder: {
    borderLeftWidth: 1,
    borderLeftColor: colors.neutral.lightGrey,
    paddingLeft: spacing.sm,
  },
  replyItem: {
    marginBottom: spacing.xs,
  },
  swipeableContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  skeletonPost: {
    marginBottom: spacing.md,
  },
  skeletonComment: {
    marginBottom: spacing.sm,
  },
});

export const CommentScreen = ({navigation, route: {params}}: Props) => {
  const {t} = useTranslation();
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    userName: string;
  } | null>(null);
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

  const handleLikeComment = async () => {
    // In a real implementation, you would call a like/unlike API
    // For now, we'll just show a toast
    showToast({
      type: 'info',
      text1: t('common.info'),
      text2: t('screens.post.like_not_implemented'),
    });
  };

  const handleReplyToComment = (comment: CommentUI) => {
    setReplyingTo({
      id: comment.id,
      userName: comment.userName,
    });
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleEditComment = (comment: CommentUI) => {
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
        parentId: replyingTo?.id,
      });

      // Reset the reply state
      setReplyingTo(null);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const mapCommentForUI = (comment: IComment): CommentUI => {
    const userName = comment.createdBy?.firstName
      ? `${comment.createdBy.firstName} ${comment.createdBy.lastName || ''}`
      : 'Unknown User';

    return {
      id: comment.id,
      userId: comment.createdBy?.id || '',
      userName: userName.trim(),
      avatarSource: comment.createdBy?.avatar
        ? {uri: comment.createdBy.avatar}
        : {uri: 'https://picsum.photos/id/1005/100/100'},
      content: comment.content,
      timeAgo: relativeTime(comment.createdAt, t),
      likeCount: 0,
      replyCount: comment.replies?.length || 0,
      isLiked: false,
    };
  };

  const isCommentOwner = (comment: CommentUI): boolean => {
    return user?.id === comment.userId;
  };

  const renderCommentWithSwipeable = useCallback(
    (commentItem: CommentUI, isReply: boolean = false, style: any = {}) => {
      const isOwner = isCommentOwner(commentItem);

      // If user is not the owner, render regular comment without swipeable
      if (!isOwner) {
        return (
          <CommentItem
            comment={commentItem}
            onLikePress={handleLikeComment}
            onReplyPress={handleReplyToComment}
            isReply={isReply}
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
            onLikePress={handleLikeComment}
            onReplyPress={handleReplyToComment}
            isReply={isReply}
            style={style}
            actionBarActive={false}
          />
        </SwipeableItem>
      );
    },
    [
      handleLikeComment,
      handleReplyToComment,
      handleEditComment,
      handleDeleteComment,
      isCommentOwner,
      params.postId,
      t,
    ],
  );

  const renderItem = useCallback(
    ({item}: {item: IComment}) => {
      // Only render top-level comments (no parentId)
      if (item.parentId) {
        return null;
      }

      const isLastComment =
        item.id === post?.comments?.[post.comments.length - 1]?.id;
      const lastReplyId = item.replies?.[item.replies.length - 1]?.id;
      const mappedComment = mapCommentForUI(item);

      return (
        <View
          style={[
            styles.commentContainer,
            isLastComment && {marginBottom: spacing.xxxl},
          ]}>
          {renderCommentWithSwipeable(mappedComment)}

          {/* Render replies */}
          {item.replies && item.replies.length > 0 && (
            <View style={styles.repliesContainer}>
              {item.replies.map(reply => {
                // Type assertion to handle partial IComment objects
                const mappedReply = mapCommentForUI(reply as IComment);
                const isLastReply = reply.id === lastReplyId;

                return (
                  <View
                    key={reply.id}
                    style={[
                      styles.replyContainer,
                      !isLastReply && styles.replyWithBorder,
                    ]}>
                    {renderCommentWithSwipeable(
                      mappedReply,
                      true,
                      styles.replyItem,
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      );
    },
    [post, renderCommentWithSwipeable, mapCommentForUI],
  );

  const loading = postLoading;

  // Render skeleton loaders when loading
  if (loading) {
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
        <Typography variant="subtitle">Post not found</Typography>
      </View>
    );
  }

  // Map the post data to the format expected by FeedCard
  const mappedPost = {
    userName: post.createdBy
      ? `${post.createdBy.firstName} ${post.createdBy.lastName || ''}`.trim()
      : 'Unknown User',
    avatarSource: post.createdBy?.avatar
      ? {uri: post.createdBy.avatar}
      : {uri: 'https://picsum.photos/id/1005/100/100'},
    timeAgo: relativeTime(post.createdAt, t),
    content: post.content,
    images: post.images ? post.images.map((img: string) => ({uri: img})) : [],
    likeCount: post.likesCount || 0,
    commentCount: post.commentsCount || 0,
    isLiked: post.isLiked || false,
    isSaved: post.isSaved || false,
    isCommented: false,
    labels:
      post.groupId && post.groupName
        ? [{icon: 'users' as IconName, text: post.groupName}]
        : [],
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={`${t('screens.post.comments')} (${post?.comments?.length || 0})`}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      {!post?.comments || post?.comments?.length === 0 ? (
        <ScrollView
          style={[styles.listContent, {flex: 1}]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <FeedCard
            userName={mappedPost.userName}
            avatarSource={mappedPost.avatarSource}
            timeAgo={mappedPost.timeAgo}
            content={mappedPost.content}
            images={mappedPost.images}
            likeCount={mappedPost.likeCount}
            commentCount={mappedPost.commentCount}
            isLiked={mappedPost.isLiked}
            isSaved={mappedPost.isSaved}
            isCommented={mappedPost.isCommented}
            labels={mappedPost.labels}
            actionBarDisabled={true}
          />
          <Body color="grey" align="center" style={{marginTop: spacing.xxxl}}>
            {t('screens.post.no_comments_yet')}
          </Body>
        </ScrollView>
      ) : (
        <FlatList
          data={post?.comments}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={
            <FeedCard
              userName={mappedPost.userName}
              avatarSource={mappedPost.avatarSource}
              timeAgo={mappedPost.timeAgo}
              content={mappedPost.content}
              images={mappedPost.images}
              likeCount={mappedPost.likeCount}
              commentCount={post?.comments?.length || 0}
              isLiked={mappedPost.isLiked}
              isSaved={mappedPost.isSaved}
              isCommented={mappedPost.isCommented}
              labels={mappedPost.labels}
              actionBarDisabled={true}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={() => {
            console.log('onEndReached');
          }}
          onEndReachedThreshold={0.5}
        />
      )}
      <CommentInput
        onSubmit={handleSubmitComment}
        replyingTo={replyingTo?.userName}
        onCancelReply={handleCancelReply}
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
