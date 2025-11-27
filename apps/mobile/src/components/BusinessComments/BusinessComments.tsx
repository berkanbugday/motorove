import React, {useCallback, useState, useEffect, RefObject} from 'react';
import {View, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {
  Body,
  Caption,
  Icon,
  Button,
  BodySmall,
  Subtitle,
  AnimatedInput,
} from '@components';
import {colors, radius, spacing} from '@theme';
import {IBusinessComment, Language} from '@motorove/shared';
import {useTranslation} from '@hooks/useTranslation';
import {formatDistanceToNow} from 'date-fns';
import {enUS, tr} from 'date-fns/locale';
import type {BottomSheetRef} from '@components/BottomSheet/BottomSheet';

interface BusinessCommentsProps {
  businessComments: IBusinessComment[];
  averageRating: number;
  commentCount: number;
  commentsLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  currentUserId?: string;
  language: string;
  onCreateComment: (rating: number, content: string) => Promise<void>;
  onUpdateComment: (
    id: string,
    rating: number,
    content: string,
  ) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  commentActionsBottomSheetRef: RefObject<BottomSheetRef | null>;
  onSelectComment: (commentId: string | null) => void;
  triggerEditCommentId: string | null;
  onEditTriggered: () => void;
  onPressProfile: (userId: string | null) => void;
}

export const BusinessComments: React.FC<BusinessCommentsProps> = ({
  businessComments,
  commentsLoading,
  createLoading,
  updateLoading,
  currentUserId,
  language,
  onCreateComment,
  onUpdateComment,
  commentActionsBottomSheetRef,
  onSelectComment,
  triggerEditCommentId,
  onEditTriggered,
  onPressProfile,
}) => {
  const {t} = useTranslation();
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [showAddComment, setShowAddComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingRating, setEditingRating] = useState(0);
  const [editingComment, setEditingComment] = useState('');
  // Handle edit trigger from parent
  useEffect(() => {
    if (triggerEditCommentId) {
      const comment = businessComments.find(c => c.id === triggerEditCommentId);
      if (comment) {
        handleEditComment(comment);
      }
      onEditTriggered();
    }
  }, [triggerEditCommentId, businessComments, onEditTriggered]);

  const handleSubmitComment = useCallback(async () => {
    if (!userRating || !userComment.trim()) {
      return;
    }

    await onCreateComment(userRating, userComment.trim());
    setShowAddComment(false);
    setUserRating(0);
    setUserComment('');
  }, [userRating, userComment, onCreateComment]);

  const handleEditComment = useCallback((comment: IBusinessComment) => {
    setEditingCommentId(comment.id);
    setEditingRating(comment.rating);
    setEditingComment(comment.content);
    setShowAddComment(false);
  }, []);

  const handleUpdateComment = useCallback(async () => {
    if (!editingCommentId || !editingRating || !editingComment.trim()) {
      return;
    }

    await onUpdateComment(
      editingCommentId,
      editingRating,
      editingComment.trim(),
    );
    setEditingCommentId(null);
    setEditingRating(0);
    setEditingComment('');
  }, [editingCommentId, editingRating, editingComment, onUpdateComment]);

  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditingRating(0);
    setEditingComment('');
  }, []);

  const handleOpenActionSheet = useCallback(
    (commentId: string) => {
      onSelectComment(commentId);
      commentActionsBottomSheetRef.current?.open('minimal');
    },
    [onSelectComment, commentActionsBottomSheetRef],
  );

  const handleAddComment = useCallback(() => {
    setShowAddComment(prev => !prev);
    setUserRating(0);
    setUserComment('');
  }, []);

  return (
    <View style={styles.commentsSection}>
      <View style={styles.commentsHeader}>
        <Subtitle weight="bold">{t('screens.map.comments_ratings')}</Subtitle>
        {(!businessComments.length ||
          !businessComments.find(
            comment => comment.createdBy?.id === currentUserId,
          )) && (
          <Button
            title={
              showAddComment
                ? t('common.cancel')
                : t('screens.map.write_comment')
            }
            variant="outline"
            shape="round"
            size="xsmall"
            iconName={showAddComment ? 'close' : 'pen-filled'}
            onPress={() => handleAddComment()}
            style={styles.addCommentButton}
          />
        )}
      </View>

      {/* Add Comment Form */}
      {showAddComment && (
        <View style={styles.addCommentForm}>
          <BodySmall weight="semiBold">
            {t('screens.map.rate_this_business')}
          </BodySmall>
          <View style={styles.userRatingStars}>
            {[1, 2, 3, 4, 5].map(star => (
              <Button
                key={star}
                variant="text"
                shape="circle"
                size="small"
                onPress={() => setUserRating(star)}
                iconName="star-filled"
                iconSize={30}
                iconColor={
                  star <= userRating
                    ? colors.status.warning
                    : colors.neutral.lightGrey
                }
              />
            ))}
          </View>

          <AnimatedInput
            showClearButton={false}
            label={t('screens.map.share_your_experience')}
            value={userComment}
            onChangeText={setUserComment}
            multiline
          />

          <Button
            title={t('screens.map.submit_comment')}
            variant="dark"
            shape="round"
            onPress={handleSubmitComment}
            disabled={
              userRating === 0 || userComment.trim() === '' || createLoading
            }
            loading={createLoading}
          />
        </View>
      )}

      {/* Business Comments List */}
      <View style={styles.commentsList}>
        {commentsLoading ? (
          <Body style={styles.loadingText}>{t('common.loading')}...</Body>
        ) : businessComments && businessComments.length > 0 ? (
          businessComments.map((comment: IBusinessComment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isEditing={editingCommentId === comment.id}
              editingRating={editingRating}
              editingComment={editingComment}
              language={language}
              onOpenActionSheet={() => handleOpenActionSheet(comment.id)}
              onCancelEdit={handleCancelEdit}
              onUpdateComment={handleUpdateComment}
              onSetEditingRating={setEditingRating}
              onSetEditingComment={setEditingComment}
              updateLoading={updateLoading}
              onPressProfile={onPressProfile}
            />
          ))
        ) : (
          <View style={styles.noCommentsContainer}>
            <BodySmall color={colors.neutral.grey}>
              {t('screens.map.no_comments_yet')}
            </BodySmall>
            <Caption color={colors.neutral.grey}>
              {t('screens.map.be_first_to_comment')}
            </Caption>
          </View>
        )}
      </View>
    </View>
  );
};

// Comment Item Component
interface CommentItemProps {
  comment: IBusinessComment;
  isEditing: boolean;
  editingRating: number;
  editingComment: string;
  language: string;
  onOpenActionSheet: () => void;
  onCancelEdit: () => void;
  onUpdateComment: () => void;
  onSetEditingRating: (rating: number) => void;
  onSetEditingComment: (comment: string) => void;
  onPressProfile: (userId: string | null) => void;
  updateLoading: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  isEditing,
  editingRating,
  editingComment,
  language,
  onOpenActionSheet,
  onCancelEdit,
  onUpdateComment,
  onSetEditingRating,
  onSetEditingComment,
  onPressProfile,
  updateLoading,
}) => {
  const {t} = useTranslation();

  if (isEditing) {
    return (
      <View key={comment.id} style={styles.commentItem}>
        <View style={styles.editCommentForm}>
          <View style={styles.editHeader}>
            <BodySmall weight="semiBold">
              {t('screens.map.edit_your_comment')}
            </BodySmall>
            <Button
              variant="text"
              shape="circle"
              size="small"
              iconName="close"
              onPress={onCancelEdit}
            />
          </View>

          <View style={styles.userRatingStars}>
            {[1, 2, 3, 4, 5].map(star => (
              <Button
                key={star}
                variant="text"
                shape="circle"
                size="small"
                onPress={() => onSetEditingRating(star)}
                iconName="star-filled"
                iconSize={30}
                iconColor={
                  star <= editingRating
                    ? colors.status.warning
                    : colors.neutral.lightGrey
                }
              />
            ))}
          </View>

          <AnimatedInput
            showClearButton={false}
            label={t('screens.map.share_your_experience')}
            value={editingComment}
            onChangeText={onSetEditingComment}
            multiline
          />

          <View style={styles.editActions}>
            <Button
              title={t('common.cancel')}
              variant="outline"
              shape="round"
              size="small"
              onPress={onCancelEdit}
              style={styles.cancelEditButton}
            />
            <Button
              title={t('common.update')}
              variant="dark"
              shape="round"
              size="small"
              onPress={onUpdateComment}
              disabled={
                editingRating === 0 ||
                editingComment.trim() === '' ||
                updateLoading
              }
              loading={updateLoading}
              style={styles.updateButton}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View key={comment.id} style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <TouchableOpacity
          style={styles.commenterInfo}
          activeOpacity={0.7}
          onPress={() => onPressProfile(comment.createdBy?.id || null)}>
          <View style={styles.commenterAvatar}>
            <Image
              source={
                comment.createdBy?.avatar
                  ? {uri: comment.createdBy?.avatar}
                  : require('@assets/images/default_avatar.png')
              }
              style={styles.avatarImage}
            />
          </View>
          <View style={styles.commenterDetails}>
            <Body weight="semiBold">
              {comment.createdBy?.firstName} {comment.createdBy?.lastName}
            </Body>
            <Caption color={colors.neutral.grey}>
              {formatDistanceToNow(new Date(comment.updatedAt), {
                addSuffix: true,
                locale:
                  language.toLowerCase() === Language.TR.toLowerCase()
                    ? tr
                    : enUS,
              })}
            </Caption>
          </View>
        </TouchableOpacity>
        <View style={styles.commentHeaderRight}>
          <View style={styles.commentRating}>
            {[1, 2, 3, 4, 5].map(star => (
              <Icon
                key={star}
                name="star-filled"
                size={12}
                color={
                  star <= comment.rating
                    ? colors.status.warning
                    : colors.neutral.lightGrey
                }
              />
            ))}
          </View>

          <Button
            variant="text"
            shape="circle"
            size="small"
            iconName="more-vertical"
            iconSize={20}
            iconColor={colors.neutral.grey}
            onPress={onOpenActionSheet}
          />
        </View>
      </View>
      <Body style={styles.commentText}>{comment.content}</Body>
    </View>
  );
};

const styles = StyleSheet.create({
  commentsSection: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  addCommentButton: {
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  addCommentForm: {
    borderWidth: 1,
    borderColor: colors.neutral.lightGrey,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  userRatingStars: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  commentsList: {
    gap: spacing.md,
  },
  commentItem: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.lightGrey,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  commenterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  commenterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  commentRating: {
    flexDirection: 'row',
    gap: 2,
  },
  commentText: {
    fontSize: 14,
    color: colors.neutral.darkGrey,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  editCommentForm: {
    gap: spacing.md,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelEditButton: {
    flex: 1,
  },
  updateButton: {
    flex: 1,
  },
  commenterDetails: {
    flex: 1,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral.black,
  },
  loadingText: {
    textAlign: 'center',
    padding: spacing.lg,
    color: colors.neutral.grey,
  },
  noCommentsContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.xs,
  },
});
