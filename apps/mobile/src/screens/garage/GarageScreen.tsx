import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  FlatList,
  RefreshControl,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {TopHeaderBar, Tabs, Button, Body, TabItem} from '@components';
import {colors, spacing} from '@theme';
import {useTranslation} from '@hooks/useTranslation';
import {
  closeBottomSheet,
  useBottomSheet,
} from '@components/BottomSheet/BottomSheetProvider';

import {MotorcycleCard, EquipmentCard} from './components';
import {mockMotorcycles, mockEquipment} from './data/mockData';
import {Motorcycle, Equipment} from './types';
import {useNavigation} from '@react-navigation/native';

export const GarageScreen = () => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const {openBottomSheet} = useBottomSheet();
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState('motorcycles');
  const [motorcycles, _setMotorcycles] = useState<Motorcycle[]>(mockMotorcycles);
  const [equipment, _setEquipment] = useState<Equipment[]>(mockEquipment);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleAddMotorcycle = useCallback(() => {
    // TODO: Navigate to add motorcycle screen
    console.log('Add motorcycle');
  }, []);

  const handleAddEquipment = useCallback(() => {
    // TODO: Navigate to add equipment screen
    console.log('Add equipment');
  }, []);

  const handleShowAddOptions = useCallback(() => {
    openBottomSheet({
      title: t('screens.garage.add_item'),
      closeButtonPosition: 'top-left',
      enableGestureControl: false,
      content: (
        <View style={styles.addOptionsContainer}>
          <Button
            title={t('screens.garage.add_motorcycle')}
            iconName="plus"
            iconPosition="left"
            variant="text"
            onPress={() => {
              handleAddMotorcycle();
              closeBottomSheet();
            }}
          />
          <View style={styles.divider} />
          <Button
            title={t('screens.garage.add_equipment')}
            iconName="plus"
            iconPosition="left"
            variant="text"
            onPress={() => {
              handleAddEquipment();
              closeBottomSheet();
            }}
          />
        </View>
      ),
      snapPoint: 'minimal',
    });
  }, [handleAddMotorcycle, handleAddEquipment, openBottomSheet, t]);

  const renderMotorcycleItem = useCallback(
    ({item}: {item: Motorcycle}) => (
      <MotorcycleCard
        motorcycle={item}
        onPress={() => console.log('Motorcycle pressed:', item.id)}
        onEdit={() => console.log('Edit motorcycle:', item.id)}
        onDelete={() => console.log('Delete motorcycle:', item.id)}
      />
    ),
    [],
  );

  const renderEquipmentItem = useCallback(
    ({item}: {item: Equipment}) => (
      <EquipmentCard
        equipment={item}
        onPress={() => console.log('Equipment pressed:', item.id)}
        onEdit={() => console.log('Edit equipment:', item.id)}
        onDelete={() => console.log('Delete equipment:', item.id)}
      />
    ),
    [],
  );

  const renderMotorcyclesContent = () => (
    <FlatList
      data={motorcycles}
      renderItem={renderMotorcycleItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.neutral.black]}
          tintColor={colors.neutral.black}
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Body>{t('screens.garage.no_motorcycles')}</Body>
          <Button
            title={t('screens.garage.add_first_motorcycle')}
            variant="outline"
            onPress={handleAddMotorcycle}
            style={styles.emptyButton}
          />
        </View>
      }
    />
  );

  const renderEquipmentContent = () => (
    <FlatList
      data={equipment}
      renderItem={renderEquipmentItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.neutral.black]}
          tintColor={colors.neutral.black}
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Body>{t('screens.garage.no_equipment')}</Body>
          <Button
            title={t('screens.garage.add_first_equipment')}
            variant="outline"
            onPress={handleAddEquipment}
            style={styles.emptyButton}
          />
        </View>
      }
    />
  );

  const tabItems: TabItem[] = [
    {
      key: 'motorcycles',
      label: t('screens.garage.motorcycles'),
      badge: motorcycles.length,
      content: renderMotorcyclesContent(),
    },
    {
      key: 'equipment',
      label: t('screens.garage.equipment'),
      badge: equipment.length,
      content: renderEquipmentContent(),
    },
  ];

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.menu.my_garage')}
        containerStyle={styles.topHeaderBar}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showShadow={false}
        rightIconName="plus"
        onRightButtonPress={handleShowAddOptions}
      />

      <SafeAreaView style={[styles.container, {marginBottom: insets.bottom}]}>
        <View style={styles.contentContainer}>
          <Tabs
            items={tabItems}
            selectedKey={activeTab}
            onTabChange={setActiveTab}
            variant="default"
            equalWidth
            containerStyle={styles.tabsContainer}
            contentContainerStyle={styles.tabContentContainer}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary.light,
  },
  topHeaderBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  tabsContainer: {
    marginTop: spacing.sm,
  },
  tabContentContainer: {
    flex: 1,
    paddingTop: spacing.md,
  },
  listContainer: {
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyButton: {
    marginTop: spacing.md,
  },
  addOptionsContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.secondary.main,
    width: '100%',
    alignSelf: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
  },
});
