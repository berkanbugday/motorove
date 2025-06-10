import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from '@navigation/types/navigationTypes';
import {colors, commonStyles, spacing} from '@theme';
import {
  Typography,
  FeedCard,
  CommentItem,
  CommentInput,
  TopHeaderBar,
  showToast,
  Body,
} from '@components';
import {Comment} from '../../types/models/post.model';
import {useGetComments, useCreateComment, useGetPost} from '@services';
import {IconName} from '@components/Icon';
import {LegendList} from '@legendapp/list';
import {relativeTime} from '@utils/dateUtils';

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

export const CommentScreen = ({navigation, route: {params}}: Props) => {
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    userName: string;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get post data
  const {
    post,
    loading: postLoading,
    error: postError,
  } = useGetPost(params.postId);

  // Get comments for the post
  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    refetch: refetchComments,
  } = useGetComments(params.postId);

  // Mutations for comments
  const {createComment, loading: createLoading} = useCreateComment(() => {
    // Refetch comments after creating a new one
    refetchComments();
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

    if (commentsError) {
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load comments. Please try again.',
      });
    }
  }, [postError, commentsError]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchComments();
    } finally {
      setRefreshing(false);
    }
  }, [refetchComments]);

  const handleLikeComment = async () => {
    // In a real implementation, you would call a like/unlike API
    // For now, we'll just show a toast
    showToast({
      type: 'info',
      text1: 'Info',
      text2: 'Like functionality not implemented yet',
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

  const handleSubmitComment = async (text: string) => {
    if (!text.trim()) {
      return;
    }

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

  const mapCommentForUI = (comment: Comment): CommentUI => {
    const userName = comment.createdBy?.firstName
      ? `${comment.createdBy.firstName} ${comment.createdBy.lastName || ''}`
      : 'Unknown User';

    return {
      id: comment.id,
      userId: comment.createdById,
      userName: userName.trim(),
      avatarSource: comment.createdBy?.avatar
        ? {uri: comment.createdBy.avatar}
        : {uri: 'https://picsum.photos/id/1005/100/100'},
      content: comment.content,
      timeAgo: relativeTime(comment.createdAt),
      likeCount: 0, // This would come from the API in a real implementation
      replyCount: comment.replies?.length || 0,
      isLiked: false, // This would come from the API in a real implementation
      parentId: comment.parentId,
    };
  };

  const renderItem = ({item}: {item: Comment}) => {
    // Only render top-level comments (no parentId)
    if (item.parentId) {
      return null;
    }

    const isLastComment = item.id === comments?.[comments.length - 1]?.id;
    const lastReplyId = item.replies?.[item.replies.length - 1]?.id;
    const mappedComment = mapCommentForUI(item);

    return (
      <View>
        <CommentItem
          comment={mappedComment}
          onLikePress={handleLikeComment}
          onReplyPress={handleReplyToComment}
          style={
            isLastComment && item.replies?.length === 0
              ? {borderBottomWidth: 0}
              : {}
          }
        />
        {item.replies &&
          item.replies.length > 0 &&
          item.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={mapCommentForUI(reply)}
              onLikePress={handleLikeComment}
              onReplyPress={handleReplyToComment}
              isReply
              style={
                isLastComment && lastReplyId === reply.id
                  ? {borderBottomWidth: 0}
                  : {}
              }
            />
          ))}
      </View>
    );
  };

  const loading = postLoading || commentsLoading;

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.neutral.black} />
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
    timeAgo: relativeTime(post.createdAt),
    content: post.content,
    images: post.images ? post.images.map(img => ({uri: img})) : [],
    likeCount: post.likesCount || 0,
    commentCount: post.commentsCount || 0,
    isLiked: post.isLiked || false,
    isSaved: post.isSaved || false,
    isCommented: false,
    labels: post.group
      ? [{icon: 'users' as IconName, text: post.group.name}]
      : [],
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={`Comments (${comments?.length || 0})`}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      {!comments || comments.length === 0 ? (
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
            No comments yet. Be the first to comment!
          </Body>
        </ScrollView>
      ) : (
        <LegendList
          data={comments}
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
              commentCount={mappedPost.commentCount}
              isLiked={mappedPost.isLiked}
              isSaved={mappedPost.isSaved}
              isCommented={mappedPost.isCommented}
              labels={mappedPost.labels}
              actionBarDisabled={true}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          recycleItems={true}
          maintainVisibleContentPosition={true}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={() => {
            console.log('onEndReached');
          }}
          onEndReachedThreshold={0.3}
        />
      )}
      <CommentInput
        onSubmit={handleSubmitComment}
        replyingTo={replyingTo?.userName}
        onCancelReply={handleCancelReply}
        isLoading={createLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});
