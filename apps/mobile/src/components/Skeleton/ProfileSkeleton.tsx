import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, spacing} from '@theme';
import Skeleton from './Skeleton';

/**
 * ProfileSkeleton component for ProfileScreen loading state
 * Mimics the actual profile layout structure
 */
export const ProfileSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* Avatar and Profile Header */}
        <View style={styles.headerTop}>
          {/* Avatar */}
          <Skeleton
            variant="avatar"
            shape="circle"
            width={80}
            height={80}
            style={styles.avatar}
          />

          {/* Profile Info */}
          <View style={styles.profileHeader}>
            {/* Name */}
            <Skeleton
              variant="text"
              size="medium"
              width={150}
              height={24}
              style={styles.nameText}
            />
            {/* Location */}
            <Skeleton variant="text" size="small" width={120} height={16} />
          </View>
        </View>

        {/* Bio */}
        <View style={styles.bioSection}>
          <Skeleton
            variant="text"
            size="medium"
            width="100%"
            height={16}
            style={styles.bioLine}
          />
          <Skeleton
            variant="text"
            size="medium"
            width="80%"
            height={16}
            style={styles.bioLine}
          />
        </View>

        {/* Social Media Icons */}
        <View style={styles.socialMediaContainer}>
          <Skeleton
            shape="circle"
            width={40}
            height={40}
            style={styles.socialIcon}
          />
          <Skeleton
            shape="circle"
            width={40}
            height={40}
            style={styles.socialIcon}
          />
          <Skeleton
            shape="circle"
            width={40}
            height={40}
            style={styles.socialIcon}
          />
        </View>

        {/* Stats Container */}
        <View style={styles.statsContainer}>
          <View style={styles.statItemRow}>
            {/* Following Stat */}
            <View style={styles.statItem}>
              <Skeleton
                variant="text"
                size="medium"
                width={40}
                height={24}
                style={styles.statValue}
              />
              <Skeleton variant="text" size="small" width={60} height={16} />
            </View>

            {/* Followers Stat */}
            <View style={styles.statItem}>
              <Skeleton
                variant="text"
                size="medium"
                width={40}
                height={24}
                style={styles.statValue}
              />
              <Skeleton variant="text" size="small" width={60} height={16} />
            </View>
          </View>
        </View>
      </View>

      {/* Tabs Section */}
      <View style={styles.tabsSection}>
        <View style={styles.tabsRow}>
          <Skeleton
            variant="text"
            size="medium"
            width={80}
            height={20}
            style={styles.tab}
          />
          <Skeleton
            variant="text"
            size="medium"
            width={80}
            height={20}
            style={styles.tab}
          />
        </View>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        <Skeleton
          variant="text"
          size="medium"
          width="100%"
          height={16}
          style={styles.contentLine}
        />
        <Skeleton
          variant="text"
          size="medium"
          width="90%"
          height={16}
          style={styles.contentLine}
        />
        <Skeleton
          variant="text"
          size="medium"
          width="95%"
          height={16}
          style={styles.contentLine}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  avatar: {
    borderWidth: 1,
    borderColor: colors.neutral.veryLightGrey,
  },
  profileHeader: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  nameText: {
    marginBottom: spacing.xs,
  },
  bioSection: {
    marginBottom: spacing.md,
  },
  bioLine: {
    marginBottom: spacing.xs,
  },
  socialMediaContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    alignSelf: 'center',
  },
  socialIcon: {
    borderWidth: 1,
    borderColor: colors.neutral.veryLightGrey,
  },
  statsContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.veryLightGrey,
    borderBottomWidth: 5,
  },
  statItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  statValue: {
    marginBottom: spacing.xs / 2,
  },
  tabsSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.veryLightGrey,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  tab: {
    marginBottom: spacing.xs,
  },
  tabContent: {
    padding: spacing.md,
  },
  contentLine: {
    marginBottom: spacing.sm,
  },
});

export default ProfileSkeleton;
