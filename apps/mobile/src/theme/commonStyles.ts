/**
 * Common reusable styles that can be applied across the app
 * Use these styles for consistent layouts and UI elements
 */

import {StyleSheet} from 'react-native';
import {colors} from './colors';
import {spacing} from './spacing';
import {radius} from './radius';
import {getShadow} from './shadows';

export const commonStyles = StyleSheet.create({
  // Layout styles
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Screen styles
  screenContainer: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.screen.horizontal,
    paddingVertical: spacing.screen.vertical,
  },

  scrollViewContent: {
    flexGrow: 1,
  },

  // Card styles
  card: {
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    ...getShadow('small'),
  },

  // Divider styles
  divider: {
    height: 1,
    backgroundColor: colors.neutral.veryLightGrey,
    width: '100%',
    marginVertical: spacing.md,
  },

  dividerWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral.veryLightGrey,
  },

  dividerText: {
    color: colors.neutral.grey,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },

  // Form related styles
  formGroup: {
    marginBottom: spacing.form.inputMarginBottom,
  },

  // Icon styles
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Text styles
  textCenter: {
    textAlign: 'center',
  },

  // Margin/Padding utilities
  mt1: {marginTop: spacing.xs},
  mt2: {marginTop: spacing.sm},
  mt3: {marginTop: spacing.md},
  mt4: {marginTop: spacing.lg},

  mb1: {marginBottom: spacing.xs},
  mb2: {marginBottom: spacing.sm},
  mb3: {marginBottom: spacing.md},
  mb4: {marginBottom: spacing.lg},

  mv1: {marginVertical: spacing.xs},
  mv2: {marginVertical: spacing.sm},
  mv3: {marginVertical: spacing.md},
  mv4: {marginVertical: spacing.lg},

  mh1: {marginHorizontal: spacing.xs},
  mh2: {marginHorizontal: spacing.sm},
  mh3: {marginHorizontal: spacing.md},
  mh4: {marginHorizontal: spacing.lg},

  pt1: {paddingTop: spacing.xs},
  pt2: {paddingTop: spacing.sm},
  pt3: {paddingTop: spacing.md},
  pt4: {paddingTop: spacing.lg},

  pb1: {paddingBottom: spacing.xs},
  pb2: {paddingBottom: spacing.sm},
  pb3: {paddingBottom: spacing.md},
  pb4: {paddingBottom: spacing.lg},

  pv1: {paddingVertical: spacing.xs},
  pv2: {paddingVertical: spacing.sm},
  pv3: {paddingVertical: spacing.md},
  pv4: {paddingVertical: spacing.lg},

  ph1: {paddingHorizontal: spacing.xs},
  ph2: {paddingHorizontal: spacing.sm},
  ph3: {paddingHorizontal: spacing.md},
  ph4: {paddingHorizontal: spacing.lg},
});
