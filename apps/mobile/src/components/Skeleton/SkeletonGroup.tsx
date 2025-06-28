import React from 'react';
import {View, StyleSheet, ViewStyle, StyleProp} from 'react-native';
import {colors, spacing} from '@theme';
import Skeleton from './Skeleton';
import {getShadowStyle} from '@components/FAB/FAB.styles';

export type SkeletonPreset =
  | 'post'
  | 'profile'
  | 'comment'
  | 'messageRow'
  | 'listItem'
  | 'eventCard'
  | 'groupCard';

export interface SkeletonGroupProps {
  /**
   * Predefined preset for common use cases
   * @default 'post'
   */
  preset?: SkeletonPreset;

  /**
   * Number of rows to show for text lines
   * @default 3
   */
  lines?: number;

  /**
   * Show avatar in the skeleton
   * @default true for 'post', 'profile', 'comment', 'messageRow' presets
   */
  showAvatar?: boolean;

  /**
   * Show header (username, time)
   * @default true for 'post', 'profile', 'comment', 'messageRow' presets
   */
  showHeader?: boolean;

  /**
   * Show image in the skeleton
   * @default true for 'post', 'eventCard' presets
   */
  showImage?: boolean;

  /**
   * Show footer (buttons/actions)
   * @default true for 'post' preset
   */
  showFooter?: boolean;

  /**
   * Show shadow effect on container
   * @default true
   */
  showShadow?: boolean;

  /**
   * Custom background color
   * @default colors.neutral.white
   */
  backgroundColor?: string;

  /**
   * Custom container style
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * SkeletonGroup component that combines multiple Skeleton components
 * into meaningful loading states for different UI patterns.
 *
 * Usage examples:
 * <SkeletonGroup /> - Default post skeleton
 * <SkeletonGroup preset="profile" /> - Profile skeleton
 * <SkeletonGroup preset="post" lines={2} showImage={false} /> - Custom post without image
 * <SkeletonGroup preset="groupCard" /> - Group card skeleton
 */
export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  preset = 'post',
  lines = 3,
  showAvatar,
  showHeader,
  showImage,
  showFooter,
  showShadow = true,
  backgroundColor = colors.neutral.white,
  style,
}) => {
  // Determine which components to show based on preset
  const determineShowAvatar = () => {
    if (showAvatar !== undefined) {
      return showAvatar;
    }
    return ['post', 'profile', 'comment', 'messageRow'].includes(preset);
  };

  const determineShowHeader = () => {
    if (showHeader !== undefined) {
      return showHeader;
    }
    return ['post', 'profile', 'comment', 'messageRow'].includes(preset);
  };

  const determineShowImage = () => {
    if (showImage !== undefined) {
      return showImage;
    }
    return ['post', 'eventCard', 'groupCard'].includes(preset);
  };

  const determineShowFooter = () => {
    if (showFooter !== undefined) {
      return showFooter;
    }
    return preset === 'post' || preset === 'groupCard';
  };

  // Setup visibility flags
  const hasAvatar = determineShowAvatar();
  const hasHeader = determineShowHeader();
  const hasImage = determineShowImage();
  const hasFooter = determineShowFooter();

  // Create container style with conditional shadow
  const containerStyle = [
    styles.container,
    {backgroundColor},
    showShadow && styles.shadow,
    getPresetContainerStyle(preset),
    style,
  ];

  // Group card specific rendering
  if (preset === 'groupCard') {
    return (
      <View style={containerStyle}>
        <View style={styles.groupCardContent}>
          {/* Group logo */}
          <Skeleton
            variant="avatar"
            shape="circle"
            size="medium"
            style={styles.groupLogo}
          />

          <View style={styles.groupInfo}>
            {/* Group name */}
            <Skeleton
              variant="text"
              size="medium"
              width={150}
              style={styles.groupName}
            />

            {/* Group location */}
            <Skeleton
              variant="text"
              size="small"
              width={100}
              style={styles.groupLocation}
            />

            {/* Group tags */}
            <View style={styles.groupTags}>
              <Skeleton
                variant="text"
                size="small"
                width={60}
                height={20}
                style={styles.groupTag}
              />
              <Skeleton
                variant="text"
                size="small"
                width={60}
                height={20}
                style={styles.groupTag}
              />
              <Skeleton
                variant="text"
                size="small"
                width={60}
                height={20}
                style={styles.groupTag}
              />
            </View>

            {/* Group members */}
            <Skeleton
              variant="text"
              size="small"
              width={80}
              style={styles.groupMembers}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {/* Header with avatar and text */}
      {hasHeader && (
        <View style={styles.header}>
          {hasAvatar && (
            <Skeleton
              variant="avatar"
              shape="circle"
              size="medium"
              style={styles.avatar}
            />
          )}
          <View style={styles.headerText}>
            <Skeleton
              variant="text"
              size="medium"
              width={120}
              style={styles.username}
            />
            <Skeleton variant="text" size="small" width={80} />
          </View>
        </View>
      )}

      {/* Content text lines */}
      <View style={styles.content}>
        {Array.from({length: lines}).map((_, index) => (
          <Skeleton
            key={`line-${index}`}
            variant="text"
            size="medium"
            width={index === lines - 1 && lines > 1 ? '80%' : '100%'}
            style={styles.textLine}
          />
        ))}
      </View>

      {/* Image placeholder */}
      {hasImage && (
        <Skeleton
          variant="card"
          size={preset === 'eventCard' ? 'small' : 'medium'}
          style={styles.image}
        />
      )}

      {/* Footer with action buttons */}
      {hasFooter && (
        <View style={styles.footer}>
          <Skeleton width={60} height={24} style={styles.action} />
          <Skeleton width={60} height={24} style={styles.action} />
          <Skeleton width={60} height={24} style={styles.action} />
        </View>
      )}
    </View>
  );
};

/**
 * Get container style based on preset
 */
const getPresetContainerStyle = (preset: SkeletonPreset): ViewStyle => {
  switch (preset) {
    case 'post':
      return {
        padding: spacing.md,
        borderRadius: 12,
        marginVertical: spacing.sm,
      };
    case 'profile':
      return {
        padding: spacing.md,
        borderRadius: 12,
      };
    case 'comment':
      return {
        padding: spacing.sm,
        paddingBottom: spacing.md,
        borderRadius: 8,
      };
    case 'messageRow':
      return {
        padding: spacing.sm,
        borderRadius: 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral.veryLightGrey,
      };
    case 'listItem':
      return {
        padding: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral.veryLightGrey,
      };
    case 'eventCard':
      return {
        padding: spacing.md,
        borderRadius: 12,
        marginVertical: spacing.sm,
      };
    case 'groupCard':
      return {
        padding: spacing.md,
        borderRadius: 12,
        marginVertical: spacing.sm,
      };
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
  },
  shadow: {
    ...getShadowStyle('small'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  username: {
    marginBottom: spacing.xs,
  },
  content: {
    marginBottom: spacing.md,
  },
  textLine: {
    marginBottom: spacing.xs,
  },
  image: {
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  action: {
    marginRight: spacing.sm,
  },
  // Group card specific styles
  groupCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  groupLogo: {
    marginRight: spacing.md,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    marginBottom: spacing.xs,
  },
  groupLocation: {
    marginBottom: spacing.sm,
  },
  groupTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  groupTag: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  groupMembers: {
    marginTop: spacing.xs,
  },
});

export default SkeletonGroup;
