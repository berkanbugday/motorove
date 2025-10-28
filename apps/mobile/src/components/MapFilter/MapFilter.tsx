import React, {useState, useCallback} from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {
  AnimatedInput,
  Button,
  Chip,
  Subtitle,
  Dropdown,
  BodySmall,
  Icon,
} from '@components';
import {colors, commonStyles, spacing} from '@theme';
import {useTranslation} from '@hooks/useTranslation';
import {BusinessCategory} from '@motorove/shared';
import {EnumUtils} from '@utils/enumUtils';
import {DropdownItem} from '@components/Dropdown/types';

export interface MapFilterValues {
  categories: BusinessCategory[];
  minRating?: number;
  searchQuery?: string;
  isOpen?: boolean;
  isOpen24h?: boolean;
}

interface MapFilterProps {
  initialValues?: MapFilterValues;
  onApply: (filters: MapFilterValues) => void;
  onReset: () => void;
  onClose: () => void;
}

const RATING_OPTIONS = [5, 4, 3]; // Bottom to top arrangement

export const MapFilter: React.FC<MapFilterProps> = ({
  initialValues,
  onApply,
  onReset,
  onClose,
}) => {
  const {t} = useTranslation();
  const [categories, setCategories] = useState<BusinessCategory[]>(
    initialValues?.categories || [],
  );
  const [minRating, setMinRating] = useState<number | undefined>(
    initialValues?.minRating,
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    initialValues?.searchQuery || '',
  );
  const [isOpen, setIsOpen] = useState<boolean | undefined>(
    initialValues?.isOpen,
  );
  const [isOpen24h, setIsOpen24h] = useState<boolean | undefined>(
    initialValues?.isOpen24h,
  );

  const handleCategorySelect = useCallback((item: DropdownItem | null) => {
    if (item && item.value) {
      const category = item.value as BusinessCategory;
      setCategories(prev => {
        if (prev.includes(category)) {
          return prev.filter(c => c !== category);
        }
        return [...prev, category];
      });
    }
  }, []);

  const handleApply = useCallback(() => {
    onApply({
      categories,
      minRating,
      searchQuery: searchQuery.trim() || undefined,
      isOpen,
      isOpen24h,
    });
    onClose();
  }, [categories, minRating, searchQuery, isOpen, isOpen24h, onApply, onClose]);

  const handleReset = useCallback(() => {
    setCategories([]);
    setMinRating(undefined);
    setSearchQuery('');
    setIsOpen(undefined);
    setIsOpen24h(undefined);
    onReset();
    onClose();
  }, [onReset, onClose]);

  const getSelectedCategory = (): DropdownItem | null => {
    // Return null for dropdown to show placeholder
    return null;
  };

  const businessCategoryOptions =
    EnumUtils.getBusinessCategoryDropdownOptions();

  const removeCategory = useCallback((category: BusinessCategory) => {
    setCategories(prev => prev.filter(c => c !== category));
  }, []);

  const getRatingDescription = (rating: number): string => {
    return t(`components.mapFilter.rating_${rating}_desc`);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Search Query */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>
            {t('components.mapFilter.title')}
          </Subtitle>
          <AnimatedInput
            label={t('components.mapFilter.search_placeholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            showClearButton={true}
            onClearSearch={() => setSearchQuery('')}
          />
        </View>

        {/* Business Categories */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>
            {t('components.mapFilter.categories_title')}
          </Subtitle>
          <Dropdown
            data={businessCategoryOptions}
            placeholder={t('components.mapFilter.category_placeholder')}
            selectedItem={getSelectedCategory()}
            onSelect={handleCategorySelect}
            showClearButton={false}
          />
          {/* Selected categories as chips */}
          {categories.length > 0 && (
            <View style={styles.selectedCategoriesContainer}>
              {categories.map(category => {
                const categoryOption = businessCategoryOptions.find(
                  opt => opt.value === category,
                );
                return (
                  <Chip
                    key={category}
                    label={categoryOption?.label || category}
                    onRemove={() => removeCategory(category)}
                    variant="filled"
                    color="dark"
                    removable={true}
                  />
                );
              })}
            </View>
          )}
        </View>

        {/* Business Status */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>
            {t('components.mapFilter.status_title')}
          </Subtitle>
          <View style={styles.statusRow}>
            <Chip
              label={t('enums.businessStatus.open')}
              onPress={() =>
                setIsOpen(prev => (prev === true ? undefined : true))
              }
              variant={isOpen ? 'filled' : 'outlined'}
              color="dark"
              selected={isOpen}
              size="medium"
            />
            <Chip
              label={t('enums.businessStatus.open_24_hours')}
              onPress={() =>
                setIsOpen24h(prev => (prev === true ? undefined : true))
              }
              variant={isOpen24h ? 'filled' : 'outlined'}
              color="dark"
              selected={isOpen24h}
              size="medium"
            />
          </View>
        </View>

        {/* Minimum Rating */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>
            {t('components.mapFilter.rating_title')}
          </Subtitle>
          <View style={styles.ratingColumn}>
            {RATING_OPTIONS.map(rating => (
              <TouchableOpacity
                key={rating}
                style={styles.radioButtonContainer}
                onPress={() =>
                  setMinRating(prev => (prev === rating ? undefined : rating))
                }
                activeOpacity={0.7}>
                <View style={styles.radioButtonRow}>
                  <BodySmall style={{flex: 1}}>
                    {getRatingDescription(rating)}
                  </BodySmall>
                  <View style={styles.ratingTextContainer}>
                    <Icon
                      name="star-filled"
                      size={20}
                      color={colors.status.warning}
                    />
                    <BodySmall>{rating}+</BodySmall>
                  </View>
                  <View style={styles.radioButton}>
                    <View
                      style={[
                        styles.radioButtonInner,
                        minRating === rating && styles.radioButtonSelected,
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title={t('common.reset')}
          onPress={handleReset}
          variant="outline"
          shape="round"
          style={{flex: 1}}
        />

        <Button
          title={t('common.apply')}
          onPress={handleApply}
          variant="dark"
          shape="round"
          style={{flex: 1}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomColor: colors.secondary.main,
    borderBottomWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ratingColumn: {
    gap: spacing.md,
  },
  radioButtonContainer: {
    paddingVertical: spacing.xs,
  },
  radioButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  radioButton: {
    width: 25,
    height: 25,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.neutral.black,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  radioButtonSelected: {
    backgroundColor: colors.neutral.black,
  },
  ratingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    color: colors.neutral.black,
    fontWeight: '600',
    fontSize: 14,
  },
  selectedCategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
});
