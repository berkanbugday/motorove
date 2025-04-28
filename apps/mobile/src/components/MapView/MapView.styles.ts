import {StyleSheet} from 'react-native';
import {colors, rs, spacing, getShadow, radius} from '@theme';

export const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    flex: 1,
  },
  controlButtonsContainer: {
    position: 'absolute',
    right: spacing.md,
    top: 230,
    flexDirection: 'column',
    gap: spacing.sm,
  },
  zoomButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.neutral.white,
    ...getShadow('small'),
  },
  recenterButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.neutral.black,
    marginTop: spacing.sm,
    ...getShadow('small'),
  },
  loadMarkerButtonContainer: {
    position: 'absolute',
    bottom: spacing.xxxxl + 10,
    alignSelf: 'center',
    zIndex: 10,
    ...getShadow('small'),
  },
  loadMarkerButtonText: {
    fontWeight: 'bold',
  },
  permissionContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    padding: spacing.md,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.neutral.darkGrey,
    fontSize: 16,
  },
  permissionButton: {
    marginVertical: spacing.sm,
    width: '80%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.neutral.darkGrey,
  },
  searchContainer: {
    position: 'absolute',
    top: spacing.xxxl,
    left: spacing.md,
    right: spacing.md,
    zIndex: 11,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: radius.round,
    padding: spacing.sm,
    width: '85%',
    ...getShadow('small'),
  },
  filterButton: {
    backgroundColor: colors.neutral.white,
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    ...getShadow('small'),
  },
  searchInput: {
    flex: 1,
    height: 30,
    paddingHorizontal: spacing.sm,
  },
  searchIcon: {
    marginLeft: spacing.sm,
  },
  clearSearchButton: {
    paddingRight: spacing.md,
  },
  searchLoader: {
    paddingRight: spacing.sm,
  },
  searchResultsContainer: {
    position: 'absolute',
    width: '77%',
    top: spacing.xxl,
    left: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: rs(16),
    maxHeight: rs(300),
    overflow: 'hidden',
  },
  searchResultItem: {
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.veryLightGrey,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral.black,
  },
  searchResultAddress: {
    fontSize: 12,
    color: colors.neutral.grey,
    marginTop: spacing.xs,
  },
  tagsContainer: {
    position: 'absolute',
    width: '100%',
    top: 130,
    left: spacing.md,
    zIndex: 10,
    ...getShadow('small'),
  },
  tagsScrollViewContent: {
    gap: spacing.sm,
  },
  markerContainer: {
    padding: 10,
    width: 25,
    height: 25,
    borderRadius: radius.round,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...getShadow('small'),
  },
  debugInfo: {
    position: 'absolute',
    bottom: spacing.xxxl,
    left: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: spacing.xs,
    borderRadius: radius.sm,
  },
  debugText: {
    color: colors.neutral.white,
    fontSize: 10,
  },
});
