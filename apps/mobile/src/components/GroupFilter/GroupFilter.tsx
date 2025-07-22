import React, {useCallback, useState, useEffect} from 'react';
import {StyleSheet, View, ScrollView, ActivityIndicator} from 'react-native';
import {
  Button,
  Checkbox,
  Subtitle,
  useBottomSheet,
  Dropdown,
  DropdownItem,
  MultiSelect,
  MultiSelectItem,
} from '@components';
import {colors, spacing} from '@theme';
import {useGetCities} from '@services/city.service';
import {IFilterGroup, GroupPrivacy, GroupMemberRole} from '@motorove/shared';
import {EnumUtils} from '@utils/enumUtils';
import {useTranslation} from '@hooks/useTranslation';

interface GroupFilterProps {
  initialFilters: IFilterGroup;
  onApplyFilters: (filters: IFilterGroup) => void;
}

export const GroupFilter: React.FC<GroupFilterProps> = ({
  initialFilters,
  onApplyFilters,
}) => {
  const {closeBottomSheet} = useBottomSheet();
  const [filters, setFilters] = useState<IFilterGroup>(initialFilters);
  const {cities, loading: isCitiesLoading} = useGetCities();
  const {t} = useTranslation();

  // Use GroupTag enum for tag options
  const groupTagDropdownItems: MultiSelectItem[] = EnumUtils.getGroupTags();

  // Convert selected tags to MultiSelectItem[]
  const selectedTagItems: MultiSelectItem[] = (filters.tags ?? [])
    .map(tagValue =>
      groupTagDropdownItems.find(item => item.value === tagValue),
    )
    .filter(Boolean) as MultiSelectItem[];

  // Convert cities to dropdown format
  const cityDropdownItems: DropdownItem[] = cities.map(city => ({
    id: city.id,
    label: city.value,
    value: city.id,
  }));

  // Find the selected city in dropdown items
  const selectedCityItem = filters.cityId
    ? cityDropdownItems.find(item => item.value === filters.cityId)
    : null;

  // Reset to initial state when props change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleCitySelect = useCallback((city: DropdownItem | null) => {
    setFilters(prev => ({
      ...prev,
      cityId: city ? city.value : null,
    }));
  }, []);

  // Remove handleTagToggle, add handleTagsChange
  const handleTagsChange = useCallback((selectedItems: MultiSelectItem[]) => {
    setFilters(prev => ({
      ...prev,
      tags:
        selectedItems.length > 0
          ? selectedItems.map(item => item.value as string)
          : null,
    }));
  }, []);

  const handlePrivacyChange = useCallback((privacy: GroupPrivacy) => {
    setFilters(prev => ({
      ...prev,
      privacy,
    }));
  }, []);

  const handleReset = useCallback(() => {
    const resetFilters: IFilterGroup = {
      cityId: null,
      tags: null,
      privacy: GroupPrivacy.ALL,
      role: GroupMemberRole.ALL,
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
    closeBottomSheet();
  }, []);

  const handleApply = useCallback(() => {
    onApplyFilters(filters);
    closeBottomSheet();
  }, [filters, onApplyFilters, closeBottomSheet]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Location filter section */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>
            {t('components.groupFilter.location')}
          </Subtitle>
          {isCitiesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
            </View>
          ) : (
            <Dropdown
              label={t('components.groupFilter.city')}
              data={cityDropdownItems}
              selectedItem={selectedCityItem}
              onSelect={handleCitySelect}
            />
          )}
        </View>

        <View style={styles.divider} />

        {/* Tags filter section */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>
            {t('components.groupFilter.tags')}
          </Subtitle>
          <MultiSelect
            label={t('components.groupFilter.group_tags')}
            data={groupTagDropdownItems}
            selectedItems={selectedTagItems}
            onSelectionChange={handleTagsChange}
            maxSelectedItems={3}
          />
        </View>

        <View style={styles.divider} />

        {/* Privacy filter section */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>
            {t('components.groupFilter.privacy_filter')}
          </Subtitle>
          <View style={styles.radioGroup}>
            <Checkbox
              label={t('enums.groupPrivacy.all')}
              checked={filters.privacy === GroupPrivacy.ALL}
              onToggle={() => handlePrivacyChange(GroupPrivacy.ALL)}
              variant="dark"
            />
            <Checkbox
              label={t('enums.groupPrivacy.public')}
              checked={filters.privacy === GroupPrivacy.PUBLIC}
              onToggle={() => handlePrivacyChange(GroupPrivacy.PUBLIC)}
              variant="dark"
            />
            <Checkbox
              label={t('enums.groupPrivacy.private')}
              checked={filters.privacy === GroupPrivacy.PRIVATE}
              onToggle={() => handlePrivacyChange(GroupPrivacy.PRIVATE)}
              variant="dark"
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, {marginBottom: 10}]}>
        <Button
          title={t('common.reset')}
          variant="outline"
          shape="round"
          onPress={handleReset}
          style={styles.resetButton}
        />
        <Button
          title={t('common.apply')}
          variant="dark"
          shape="round"
          onPress={handleApply}
          style={styles.applyButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.secondary.light,
    marginVertical: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
    backgroundColor: colors.neutral.white,
  },
  resetButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  applyButton: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagChip: {
    marginBottom: spacing.xs,
  },
  loadingContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
