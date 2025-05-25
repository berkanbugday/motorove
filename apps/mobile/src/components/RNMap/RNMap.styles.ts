import {StyleSheet} from 'react-native';
import {colors} from '@theme/colors';
import {getShadow} from '@theme/shadows';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  hiddenMap: {
    opacity: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    zIndex: 10,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    padding: 16,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 16,
    color: colors.neutral.darkGrey,
    fontSize: 16,
  },
  permissionButton: {
    marginVertical: 8,
    width: '80%',
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  tagsContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 10,
    zIndex: 5,
  },
  controlsContainer: {
    position: 'absolute',
    right: 16,
    top: 200,
    zIndex: 5,
  },
  loadMarkerButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    ...getShadow('small'),
    zIndex: 10,
  },
  debugInfo: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 5,
    zIndex: 5,
  },
  debugInfoText: {
    color: colors.neutral.white,
    fontSize: 10,
  },
});
