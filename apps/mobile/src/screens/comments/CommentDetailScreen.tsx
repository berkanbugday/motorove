import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from '@navigation/types/navigationTypes';
import {colors, spacing} from '@theme';
import {
  Typography,
  FeedCard,
  CommentItem,
  CommentInput,
  Icon,
} from '@components';
import {Comment, PostWithComments} from '../../components/Comment/comments';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// Mock data for a post with comments
// In a real app, this would come from an API
const mockPost: PostWithComments = {
  id: '1',
  userName: 'Alex Johnson',
  avatarSource: {uri: 'https://picsum.photos/id/1005/100/100'},
  timeAgo: '2h ago',
  content:
    'Just completed an amazing coastal ride with perfect weather! The views were breathtaking.',
  images: [{uri: 'https://picsum.photos/id/16/500/300'}],
  routeTitle: 'Pacific Coast Highway',
  likeCount: 24,
  commentCount: 12,
  isSaved: false,
  isLiked: true,
  isCommented: false,
  labels: [
    {icon: 'users', text: 'Coastal Riders Club'},
    {icon: 'map-pin', text: 'San Francisco, CA'},
  ],
  comments: [
    {
      id: '1',
      userId: '2',
      userName: 'Sarah Miller',
      avatarSource: {uri: 'https://picsum.photos/id/1027/100/100'},
      content: 'That view is incredible! Was this a group ride?',
      timeAgo: '1h ago',
      likeCount: 5,
      replyCount: 2,
      isLiked: false,
    },
    {
      id: '2',
      userId: '3',
      userName: 'David Wilson',
      avatarSource: {uri: 'https://picsum.photos/id/1012/100/100'},
      content: 'I did that route last weekend. The weather was perfect!',
      timeAgo: '1h ago',
      likeCount: 2,
      replyCount: 0,
      isLiked: true,
    },
    {
      id: '3',
      parentId: '1',
      userId: '1',
      userName: 'Alex Johnson',
      avatarSource: {uri: 'https://picsum.photos/id/1005/100/100'},
      content:
        'Yes! It was with the Coastal Riders Club. We had about 8 people.',
      timeAgo: '45m ago',
      likeCount: 3,
      replyCount: 0,
      isLiked: false,
    },
    {
      id: '4',
      parentId: '1',
      userId: '4',
      userName: 'Emma Brown',
      avatarSource: {uri: 'https://picsum.photos/id/1014/100/100'},
      content: 'I missed this one! Will you be doing it again soon?',
      timeAgo: '30m ago',
      likeCount: 1,
      replyCount: 0,
      isLiked: false,
    },
    {
      id: '5',
      userId: '5',
      userName: 'Michael Davis',
      avatarSource: {uri: 'https://picsum.photos/id/1025/100/100'},
      content: 'What bike were you riding? Looks like a fun trip!',
      timeAgo: '25m ago',
      likeCount: 0,
      replyCount: 0,
      isLiked: false,
    },
  ],
};

// Current user for comment input avatar
const currentUser = {
  id: 'current',
  avatarSource: {uri: 'https://picsum.photos/id/1018/100/100'},
};

type Props = NativeStackScreenProps<MainStackParamList, 'CommentDetail'>;

export function CommentDetailScreen({navigation, route: {params}}: Props) {
  const insets = useSafeAreaInsets();
  const [post, setPost] = useState<PostWithComments | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    userName: string;
  } | null>(null);

  useEffect(() => {
    // In a real app, you would fetch the post and comments from an API based on params.postId
    // For this example, we'll use the mock data
    const fetchPost = async () => {
      // Simulate API call
      setTimeout(() => {
        setPost(mockPost);
        setLoading(false);
      }, 500);
    };

    fetchPost();
  }, [params.postId]);

  const handleLikeComment = (commentId: string) => {
    if (!post) return;

    // Update the like status for the comment
    const updatedComments = post.comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likeCount: comment.isLiked
            ? comment.likeCount - 1
            : comment.likeCount + 1,
        };
      }
      return comment;
    });

    setPost({...post, comments: updatedComments});
  };

  const handleReplyToComment = (comment: Comment) => {
    setReplyingTo({id: comment.id, userName: comment.userName});
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleSubmitComment = (text: string) => {
    if (!post) return;

    // Create a new comment
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      userName: 'You',
      avatarSource: currentUser.avatarSource,
      content: text,
      timeAgo: 'Just now',
      likeCount: 0,
      replyCount: 0,
      isLiked: false,
      parentId: replyingTo ? replyingTo.id : undefined,
    };

    // Add the new comment to the list
    const updatedComments = [...post.comments, newComment];

    // Update the post with the new comment
    setPost({
      ...post,
      comments: updatedComments,
      commentCount: post.commentCount + 1,
    });

    // Reset the reply state
    setReplyingTo(null);
  };

  const renderItem = ({item}: {item: Comment}) => {
    // Only render top-level comments (no parentId)
    if (item.parentId) return null;

    // Find any replies to this comment
    const replies = post?.comments.filter(
      comment => comment.parentId === item.id,
    );

    return (
      <View>
        <CommentItem
          comment={item}
          onLikePress={handleLikeComment}
          onReplyPress={handleReplyToComment}
        />
        {replies &&
          replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onLikePress={handleLikeComment}
              onReplyPress={handleReplyToComment}
              isReply
            />
          ))}
      </View>
    );
  };

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

  return (
    <SafeAreaView style={[styles.container, {paddingBottom: insets.bottom}]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
          style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.neutral.black} />
        </TouchableOpacity>
        <Typography variant="subtitle" weight="medium">
          Comments ({post.commentCount})
        </Typography>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={post.comments}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View style={styles.postContainer}>
            <FeedCard
              userName={post.userName}
              avatarSource={post.avatarSource}
              timeAgo={post.timeAgo}
              content={post.content}
              images={post.images}
              routeTitle={post.routeTitle}
              likeCount={post.likeCount}
              commentCount={post.commentCount}
              isLiked={post.isLiked}
              isSaved={post.isSaved}
              isCommented={post.isCommented}
              labels={post.labels}
            />
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <CommentInput
        onSubmit={handleSubmitComment}
        userAvatar={currentUser.avatarSource}
        replyingTo={replyingTo?.userName}
        onCancelReply={handleCancelReply}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.veryLightGrey,
    backgroundColor: colors.neutral.white,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  headerRight: {
    width: 24,
    height: 24,
  },
  postContainer: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
});
