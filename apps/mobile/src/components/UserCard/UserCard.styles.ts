import {StyleSheet} from 'react-native';
import {colors, spacing, radius, commonStyles} from '@theme';

export const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: colors.neutral.veryLightGrey,
  },
  content: {
    flexDirection: 'row',
    padding: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.neutral.black,
    marginRight: spacing.md,
    alignSelf: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs / 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: spacing.xs / 2,
  },
  tagSeparator: {
    marginHorizontal: spacing.xs / 2,
  },
  infoText: {
    marginLeft: spacing.xs / 2,
  },
  buttonContainer: {
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
