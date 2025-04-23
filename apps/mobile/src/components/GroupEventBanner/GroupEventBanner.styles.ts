import {StyleSheet} from 'react-native';
import {colors, spacing, radius} from '@theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: colors.neutral.black,
    alignItems: 'center',
  },

  // Date section styles
  dateContainer: {
    backgroundColor: colors.neutral.veryLightGrey,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingRight: spacing.md,
    paddingLeft: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    // width: 70,
    // height: 70,
    left: spacing.sm,
  },
  // Content section styles
  contentContainer: {
    padding: spacing.md,
    flex: 1,
  },
  title: {
    paddingRight: 70, // Make room for the chat button
  },
  organizer: {
    marginBottom: spacing.xs,
    paddingRight: 70,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    marginLeft: spacing.xs,
  },

  // Chat button styles
  chatButton: {
    backgroundColor: colors.neutral.black,
  },
  chatButtonContainer: {
    position: 'absolute',
    right: spacing.xs,
  },
});
