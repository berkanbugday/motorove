import React from 'react';
import {StyleSheet, Platform} from 'react-native';
import {View, Text} from 'react-native-ui-lib';
import {SafeAreaView} from 'react-native-safe-area-context';
import {getDefaultHeaderHeight} from '@react-navigation/elements';

const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 0;

interface HeaderProps {
  title: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  headerHeight?: number;
  backgroundColor?: string;
  showHeader?: boolean;
}

export const Header = ({
  title,
  leftComponent,
  rightComponent,
  headerHeight = getDefaultHeaderHeight(
    {
      height: STATUSBAR_HEIGHT + APPBAR_HEIGHT,
      width: 0,
    },
    false,
    0,
  ),
  backgroundColor = '#FFFFFF',
}: HeaderProps): React.ReactElement => {
  return (
    <SafeAreaView edges={['top']} style={{backgroundColor}}>
      <View style={[styles.header, {height: headerHeight}]}>
        <View style={styles.left} center>
          {leftComponent}
        </View>
        <View style={styles.titleContainer} center>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.right} center>
          {rightComponent}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  left: {
    minWidth: 40,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 17 : 20,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    color: Platform.select({
      ios: '#000000',
      android: '#000000',
      default: '#000000',
    }),
  },
  right: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});
