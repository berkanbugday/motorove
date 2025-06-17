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
import {Comment} from '../comments';
import {Icon} from '@components';

interface CommentItemProps {
  comment: Comment;
  onLikePress?: (commentId: string) => void;
  onReplyPress?: (comment: Comment) => void;
  style?: StyleProp<ViewStyle>;
  isReply?: boolean;
  actionBarActive?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onLikePress,
  onReplyPress,
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
      <Image source={comment.avatarSource} style={styles.avatar} />
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Typography variant="bodySmall" weight="semiBold">
            {comment.userName}
          </Typography>
          <Typography
            variant="caption"
            color={colors.neutral.grey}
            style={styles.timeAgo}>
            {comment.timeAgo}
          </Typography>
        </View>

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

export default CommentItem;
