import React from 'react';
import {View, StyleSheet, ScrollView, Text} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useMapFilter, MapFilterState} from '@hooks/useMapFilter';
import {Button} from '@components/Button';
import {useBottomSheet} from '@components/BottomSheet';
import {colors} from '@theme/colors';
import {getShadow} from '@theme/shadows';

interface MapFilterProps {
  onFilterChange?: (filter: MapFilterState) => void;
}

export const RNMapFilter: React.FC<MapFilterProps> = ({onFilterChange}) => {
  const theme = useTheme();
  const {openBottomSheet} = useBottomSheet();
  const {filterState, updateFilter, resetFilter, toggleFilter} = useMapFilter();

  const handleFilterChange = (newFilter: Partial<MapFilterState>) => {
    updateFilter(newFilter);
    onFilterChange?.({...filterState, ...newFilter});
  };

  const handleOpenFilter = () => {
    openBottomSheet({
      title: 'Filter',
      showCloseButton: true,
      closeButtonPosition: 'top-left',
      contentStyle: styles.bottomSheetContent,
      onClose: toggleFilter,
      content: (
        <ScrollView style={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Price Range
            </Text>
            <View style={styles.rangeContainer}>
              <Text style={[styles.valueText, {color: theme.colors.text}]}>
                ${filterState.priceRange[0]}
              </Text>
              <Text style={[styles.valueText, {color: theme.colors.text}]}>
                ${filterState.priceRange[1]}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Distance (km)
            </Text>
            <Text style={[styles.valueText, {color: theme.colors.text}]}>
              {filterState.distance} km
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Reset"
              variant="outline"
              shape="round"
              size="medium"
              onPress={resetFilter}
              style={styles.button}
            />
            <Button
              title="Apply"
              variant="dark"
              shape="round"
              size="medium"
              onPress={() => {
                handleFilterChange(filterState);
                toggleFilter();
              }}
              style={styles.button}
            />
          </View>
        </ScrollView>
      ),
    });
  };

  return (
    <Button
      style={styles.filterButton}
      onPress={handleOpenFilter}
      variant="primary"
      shape="circle"
      size="small"
      iconName="sliders"
      iconSize={20}
      iconColor={colors.neutral.black}
    />
  );
};

const styles = StyleSheet.create({
  filterButton: {
    backgroundColor: colors.neutral.white,
    position: 'absolute',
    width: 40,
    height: 40,
    right: 0,
    ...getShadow('small'),
  },
  bottomSheetContent: {
    paddingTop: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  rangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  valueText: {
    fontSize: 14,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});
