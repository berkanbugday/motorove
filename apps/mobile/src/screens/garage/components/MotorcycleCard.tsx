import React, {useCallback} from 'react';
import {StyleSheet, View, TouchableOpacity, Image} from 'react-native';
import {Typography, Icon} from '@components';
import {colors, spacing, radius} from '@theme';
import {MotorcycleCardProps} from '../types';
import {formatDistanceToNow} from 'date-fns';
import {tr, enUS} from 'date-fns/locale';
import {useLanguage} from '@contexts/LanguageContext';
import {Language} from '@motorove/shared';

export const MotorcycleCard: React.FC<MotorcycleCardProps> = ({
  motorcycle,
  onPress,
}) => {
  const {language} = useLanguage();

  const formatTimeAgo = useCallback(
    (dateString: string) => {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale:
          language.toLowerCase() === Language.TR.toLowerCase() ? tr : enUS,
      });
    },
    [language],
  );

  const renderImage = () => {
    if (motorcycle.images && motorcycle.images.length > 0) {
      return (
        <Image
          source={{uri: motorcycle.images[0]}}
          style={styles.image}
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={styles.placeholderImage}>
        <Icon name="wrench" size={40} color={colors.neutral.grey} />
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.content}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          {renderImage()}
          {motorcycle.images && motorcycle.images.length > 1 && (
            <View style={styles.imageCountBadge}>
              <Typography variant="caption" color={colors.neutral.white}>
                +{motorcycle.images.length - 1}
              </Typography>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Typography
                variant="subtitle"
                weight="bold"
                color={colors.neutral.black}
                numberOfLines={1}>
                {motorcycle.brand} {motorcycle.model}
              </Typography>
              {motorcycle.year && (
                <Typography
                  variant="body"
                  color={colors.neutral.grey}
                  style={styles.year}>
                  {motorcycle.year}
                </Typography>
              )}
            </View>
          </View>

          {motorcycle.description && (
            <Typography
              variant="body"
              color={colors.neutral.darkGrey}
              numberOfLines={2}
              style={styles.description}>
              {motorcycle.description}
            </Typography>
          )}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon
                name="clock"
                size={14}
                color={colors.neutral.grey}
                style={styles.metaIcon}
              />
              <Typography variant="body" color={colors.neutral.grey}>
                {formatTimeAgo(motorcycle.updatedAt)}
              </Typography>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: spacing.md,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: radius.sm,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.secondary.light,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCountBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  year: {
    marginTop: 2,
  },
  menuButton: {
    padding: spacing.xs,
  },
  description: {
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: spacing.xs,
  },
});
