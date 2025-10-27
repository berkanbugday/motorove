import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing, radius} from '@theme';
import {Typography, Icon} from '@components';
import {useTranslation} from '@hooks/useTranslation';

interface PostCommentInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  replyingTo?: string;
  onCancelReply?: () => void;
  isLoading?: boolean;
  initialValue?: string;
  editing?: boolean;
  onCancelEdit?: () => void;
}

const PostCommentInput: React.FC<PostCommentInputProps> = ({
  onSubmit,
  placeholder,
  style,
  replyingTo,
  onCancelReply,
  isLoading = false,
  initialValue = '',
  editing = false,
  onCancelEdit,
}) => {
  const [text, setText] = useState(initialValue);
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();

  // Update text when initialValue changes (for editing mode)
  useEffect(() => {
    if (initialValue) {
      setText(initialValue);
    }
  }, [initialValue]);

  const handleSubmit = () => {
    if (text.trim().length > 0) {
      onSubmit(text);
      setText('');
    }
  };

  const handleCancel = () => {
    if (editing && onCancelEdit) {
      onCancelEdit();
      setText('');
    } else if (replyingTo && onCancelReply) {
      onCancelReply();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={style}>
      <SafeAreaView style={[styles.container, {paddingBottom: insets.bottom}]}>
        {(replyingTo || editing) && (
          <View style={styles.replyingContainer}>
            <Typography variant="caption" color={colors.neutral.grey}>
              {editing ? (
                t('components.postComment.editing_comment')
              ) : (
                <>
                  {t('components.postComment.replying_to')}{' '}
                  <Typography variant="caption" weight="bold">
                    {replyingTo}
                  </Typography>
                </>
              )}
            </Typography>
            <TouchableOpacity
              onPress={handleCancel}
              hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
              <Icon name="close" size={16} color={colors.neutral.grey} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            value={text}
            onChangeText={setText}
            style={styles.input}
            placeholder={
              editing
                ? t('components.postComment.edit_your_comment')
                : placeholder || t('components.postComment.add_comment')
            }
            multiline
            maxLength={500}
            editable={!isLoading}
            placeholderTextColor={colors.neutral.lightGrey}
          />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={text.trim().length === 0 || isLoading}
            style={[
              styles.sendButton,
              (text.trim().length === 0 || isLoading) && styles.disabledButton,
            ]}>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.neutral.white} />
            ) : (
              <Icon
                name={editing ? 'pen' : 'paper-plane'}
                size={18}
                color={
                  text.trim().length === 0
                    ? colors.neutral.lightGrey
                    : colors.neutral.white
                }
              />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
    backgroundColor: colors.neutral.white,
  },
  replyingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.secondary.main,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.neutral.black,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  disabledButton: {
    backgroundColor: colors.neutral.veryLightGrey,
  },
});

export default PostCommentInput;
