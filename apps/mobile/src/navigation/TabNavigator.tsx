import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {HomeScreen} from '../screens/HomeScreen';
import {GroupsNavigator} from './GroupsNavigator';
import {MapScreen} from '../screens/Map/MapScreen';
import {RecordScreen} from '../screens/Record';
import {ProfileStack} from './ProfileStack';

const Tab = createBottomTabNavigator();

const HomeIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="home" color={color} size={size} />
);

const MapIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="map-search" color={color} size={size} />
);

const RecordIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="radiobox-marked" color={color} size={size} />
);

const GroupsIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="account-group" color={color} size={size} />
);

const ProfileIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="account" color={color} size={size} />
);

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
        },
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Maps"
        component={MapScreen}
        options={{
          tabBarIcon: MapIcon,
        }}
      />
      <Tab.Screen
        name="Record"
        component={RecordScreen}
        options={{
          tabBarIcon: RecordIcon,
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsNavigator}
        options={{
          tabBarIcon: GroupsIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
}
