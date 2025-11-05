import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {Typography} from '../../Typography/Typography';
import {colors, spacing} from '@theme';
import {PostComment} from '../post-comment.interface';
import {Icon} from '@components';

interface PostCommentItemProps {
  comment: PostComment;
  onLikePress?: (commentId: string) => void;
  onReplyPress?: (comment: PostComment) => void;
  onPressAvatar?: (userId: string) => void;
  style?: StyleProp<ViewStyle>;
  isReply?: boolean;
  actionBarActive?: boolean;
}

const PostCommentItem: React.FC<PostCommentItemProps> = ({
  comment,
  onLikePress,
  onReplyPress,
  onPressAvatar,
  style,
  isReply = false,
  actionBarActive = true,
}) => {
  const handleLikePress = () => {
    if (onLikePress) {
      onLikePress(comment.id);
    }
  };

  const handleReplyPress = () => {
    if (onReplyPress) {
      onReplyPress(comment);
    }
  };

  return (
    <View style={[styles.container, isReply && styles.replyContainer, style]}>
      <TouchableOpacity
        disabled={!onPressAvatar}
        activeOpacity={0.6}
        onPress={() => onPressAvatar?.(comment.userId)}>
        <Image source={comment.avatarSource} style={styles.avatar} />
      </TouchableOpacity>
      <View style={styles.contentContainer}>
        <TouchableOpacity
          disabled={!onPressAvatar}
          activeOpacity={0.6}
          onPress={() => onPressAvatar?.(comment.userId)}
          style={styles.header}>
          <Typography variant="bodySmall" weight="semiBold">
            {comment.fullName}
          </Typography>
          <Typography
            variant="caption"
            color={colors.neutral.grey}
            style={styles.timeAgo}>
            {comment.timeAgo}
          </Typography>
        </TouchableOpacity>

        <Typography variant="body" style={styles.content}>
          {comment.content}
        </Typography>

        {actionBarActive && (
          <View style={styles.actionBar}>
            <TouchableOpacity
              onPress={handleLikePress}
              style={styles.actionButton}>
              <Icon
                name={comment.isLiked ? 'like-filled' : 'like'}
                size={16}
                color={
                  comment.isLiked ? colors.primary.main : colors.neutral.grey
                }
              />
              <Typography
                variant="caption"
                color={
                  comment.isLiked ? colors.primary.main : colors.neutral.grey
                }
                style={styles.actionText}>
                {comment.likeCount}
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleReplyPress}
              style={styles.actionButton}>
              <Icon name="comment" size={16} color={colors.neutral.grey} />
              <Typography
                variant="caption"
                color={colors.neutral.grey}
                style={styles.actionText}>
                Reply
              </Typography>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.veryLightGrey,
  },
  replyContainer: {
    marginLeft: spacing.xl,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.xs,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.black,
  },
  contentContainer: {
    flex: 1,
    padding: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeAgo: {
    marginLeft: spacing.xs,
  },
  content: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  actionBar: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionText: {
    marginLeft: spacing.xs / 2,
  },
});

export default PostCommentItem;
