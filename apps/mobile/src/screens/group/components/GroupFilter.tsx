import React, {useCallback, useState, useEffect} from 'react';
import {StyleSheet, View, ScrollView, ActivityIndicator} from 'react-native';
import {Button} from '@components/Button';
import {Checkbox} from '@components/Checkbox';
import {Subtitle} from '@components/Typography';
import {colors, spacing} from '@theme';
import {useBottomSheet} from '@components/BottomSheet/BottomSheetProvider';
import {useGetCities} from '@services/city.service';
import {useGetGroupTags} from '@services/group-tag.service';
import Dropdown from '@components/Dropdown';
import {DropdownItem} from '@components/Dropdown/types';
import {Chip} from '@components/Chip';

export interface GroupFilters {
  city: string | null;
  tags: string[];
  privacy: 'ALL' | 'PUBLIC' | 'PRIVATE';
}

interface GroupFilterProps {
  initialFilters: GroupFilters;
  onApplyFilters: (filters: GroupFilters) => void;
}

export const GroupFilter: React.FC<GroupFilterProps> = ({
  initialFilters,
  onApplyFilters,
}) => {
  const {closeBottomSheet} = useBottomSheet();
  const [filters, setFilters] = useState<GroupFilters>(initialFilters);
  const {cities, loading: isCitiesLoading} = useGetCities();
  const {groupTags, loading: isTagsLoading} = useGetGroupTags();

  // Convert cities to dropdown format
  const cityDropdownItems: DropdownItem[] = cities.map(city => ({
    id: city.id,
    label: city.value,
    value: city.id,
  }));

  // Find the selected city in dropdown items
  const selectedCityItem = filters.city
    ? cityDropdownItems.find(item => item.value === filters.city)
    : null;

  // Reset to initial state when props change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleCitySelect = useCallback((city: DropdownItem | null) => {
    setFilters(prev => ({
      ...prev,
      city: city ? city.value : null,
    }));
  }, []);

  const handleTagToggle = useCallback((tagValue: string) => {
    setFilters(prev => {
      const tagIndex = prev.tags.indexOf(tagValue);
      if (tagIndex >= 0) {
        // Remove tag if already selected
        return {
          ...prev,
          tags: prev.tags.filter(t => t !== tagValue),
        };
      } else {
        // Add tag if not selected
        return {
          ...prev,
          tags: [...prev.tags, tagValue],
        };
      }
    });
  }, []);

  const handlePrivacyChange = useCallback(
    (privacy: 'ALL' | 'PUBLIC' | 'PRIVATE') => {
      setFilters(prev => ({
        ...prev,
        privacy,
      }));
    },
    [],
  );

  const handleReset = useCallback(() => {
    const resetFilters: GroupFilters = {
      city: null,
      tags: [],
      privacy: 'ALL',
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
          <Subtitle style={styles.sectionTitle}>Location</Subtitle>
          {isCitiesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
            </View>
          ) : (
            <Dropdown
              label="Select City"
              data={cityDropdownItems}
              selectedItem={selectedCityItem}
              onSelect={handleCitySelect}
              placeholder="Select a city"
              searchable={true}
            />
          )}
        </View>

        <View style={styles.divider} />

        {/* Tags filter section */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>Tags</Subtitle>
          {isTagsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
            </View>
          ) : (
            <View style={styles.tagsContainer}>
              {groupTags.map(tag => (
                <Chip
                  key={tag.id}
                  variant={
                    filters.tags.includes(tag.id) ? 'filled' : 'outlined'
                  }
                  color="dark"
                  label={tag.value}
                  onPress={() => handleTagToggle(tag.id)}
                  style={styles.tagChip}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Privacy filter section */}
        <View style={styles.section}>
          <Subtitle style={styles.sectionTitle}>Privacy</Subtitle>
          <View style={styles.radioGroup}>
            <Checkbox
              label="All"
              checked={filters.privacy === 'ALL'}
              onToggle={() => handlePrivacyChange('ALL')}
              variant="dark"
            />
            <Checkbox
              label="Public"
              checked={filters.privacy === 'PUBLIC'}
              onToggle={() => handlePrivacyChange('PUBLIC')}
              variant="dark"
            />
            <Checkbox
              label="Private"
              checked={filters.privacy === 'PRIVATE'}
              onToggle={() => handlePrivacyChange('PRIVATE')}
              variant="dark"
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, {marginBottom: 10}]}>
        <Button
          title="Reset"
          variant="outline"
          shape="round"
          onPress={handleReset}
          style={styles.resetButton}
        />
        <Button
          title="Apply Filters"
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
    backgroundColor: colors.secondary.main,
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
