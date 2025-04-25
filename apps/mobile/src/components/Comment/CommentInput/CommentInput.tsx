import React, {useState} from 'react';
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
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing, radius} from '@theme';
import {Typography, Icon} from '@components';

interface CommentInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  replyingTo?: string;
  onCancelReply?: () => void;
}

const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  placeholder = 'Add a comment...',
  style,
  replyingTo,
  onCancelReply,
}) => {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();

  const handleSubmit = () => {
    if (text.trim().length > 0) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={style}>
      <SafeAreaView style={[styles.container, {paddingBottom: insets.bottom}]}>
        {replyingTo && (
          <View style={styles.replyingContainer}>
            <Typography variant="caption" color={colors.neutral.grey}>
              Replying to{' '}
              <Typography variant="caption" weight="bold">
                {replyingTo}
              </Typography>
            </Typography>
            <TouchableOpacity
              onPress={onCancelReply}
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
            placeholder={placeholder}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={text.trim().length === 0}
            style={[
              styles.sendButton,
              text.trim().length === 0 && styles.disabledButton,
            ]}>
            <Icon
              name="paper-plane"
              size={20}
              color={
                text.trim().length === 0
                  ? colors.neutral.lightGrey
                  : colors.neutral.white
              }
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.veryLightGrey,
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
    borderColor: colors.neutral.veryLightGrey,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
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

export default CommentInput;
