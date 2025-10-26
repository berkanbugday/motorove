import {StyleSheet} from 'react-native';
import {radius, spacing} from '@theme';

export const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherInfo: {
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  locationIcon: {
    marginRight: spacing.xs,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  weatherInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  temperature: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  condition: {
    fontSize: 16,
  },
  weatherDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  detailText: {
    fontSize: 12,
    marginLeft: spacing.xs,
  },
  weatherIconContainer: {
    marginLeft: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  weatherIcon: {
    width: 80,
    height: 80,
  },
  unit: {
    fontSize: 16,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
