import {StyleSheet} from 'react-native';
import {colors, spacing} from '@theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: spacing.lg,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral.black,
  },
  participantInfo: {
    flex: 1,
  },
});
