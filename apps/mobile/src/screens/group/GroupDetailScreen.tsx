import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {colors, getShadow, radius, spacing} from '@theme';
import {TopHeaderBar} from '@components/TopHeaderBar';
import {Typography} from '@components/Typography';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {
  MainScreenNavigationProp,
  MainStackParamList,
} from '@navigation/types/navigationTypes';
import {useGetGroup} from '@services/group.service';

type GroupDetailScreenRouteProp = RouteProp<MainStackParamList, 'GroupDetail'>;

/**
 * GroupDetail Screen - Displays detailed information about a specific group
 */
export const GroupDetailScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'GroupDetail'>>();
  const route = useRoute<GroupDetailScreenRouteProp>();
  const {groupId} = route.params;

  // Use the useGetGroup hook to fetch the group data
  const {group, loading, error} = useGetGroup(groupId);

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar
        showBackButton
        backgroundColor="transparent"
        onBackPress={handleGoBack}
        rightIconName="more-vertical"
        containerStyle={styles.topHeaderBar}
      />
      <View style={styles.imageContainer}>
        <Image
          source={{uri: group?.cover || ''}}
          style={styles.cover}
          resizeMode="cover"
        />
      </View>
      <View style={styles.logoContainer}>
        <Image source={{uri: group?.logo || ''}} style={styles.logo} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  logoContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: 150,
    alignSelf: 'center',
    ...getShadow('medium'),
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: radius.round,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  topHeaderBar: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  uploadText: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  coverContainer: {
    height: 150,
    overflow: 'hidden',
    backgroundColor: colors.secondary.light,
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formFields: {
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  fieldLabel: {
    marginBottom: spacing.xs,
    color: colors.neutral.darkGrey,
  },
  tagsSection: {
    marginTop: spacing.lg,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  tagChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.light,
  },
  errorText: {
    marginBottom: spacing.xs,
  },
});
