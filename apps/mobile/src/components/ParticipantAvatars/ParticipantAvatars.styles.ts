import {StyleSheet} from 'react-native';
import {colors} from '@theme';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingAvatars: {
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
