import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  Animated,
} from 'react-native';
import {LegendList} from '@legendapp/list';
import {colors, commonStyles, getShadow, radius, spacing} from '@theme';
import {TopHeaderBar} from '@components/TopHeaderBar';
import {BodySmall, Title, Typography} from '@components/Typography';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {
  MainScreenNavigationProp,
  MainStackParamList,
} from '@navigation/types/navigationTypes';
import {useGetGroup} from '@services/group.service';
import {Icon, IconName} from '@components/Icon';
import {Chip} from '@components/Chip';
import {Button} from '@components/Button';
import {FeedCard} from '@components/FeedCard';

type GroupDetailScreenRouteProp = RouteProp<MainStackParamList, 'GroupDetail'>;

// Feed post interface
interface FeedPost {
  id: string;
  userName: string;
  avatarSource: ImageSourcePropType;
  timeAgo: string;
  content: string;
  images?: ImageSourcePropType[];
  routeTitle?: string;
  likeCount: number;
  commentCount: number;
  isSaved: boolean;
  isLiked: boolean;
  isCommented: boolean;
  labels: Array<{
    icon?: IconName;
    text: string;
  }>;
}

// Sample feed posts data for this group
const groupFeedPosts: FeedPost[] = [
  {
    id: '1',
    userName: 'Alex Johnson',
    avatarSource: {uri: 'https://picsum.photos/id/1005/100/100'},
    timeAgo: '2h ago',
    content:
      'Just completed an amazing group ride with the team! The roads were perfect today.',
    routeTitle: 'Mountain Pass Loop',
    likeCount: 24,
    commentCount: 5,
    isSaved: false,
    isLiked: true,
    isCommented: false,
    labels: [
      {icon: 'users', text: 'Group Ride'},
      {icon: 'map-pin', text: 'Blue Ridge Mountains'},
    ],
  },
  {
    id: '2',
    userName: 'Sarah Miller',
    avatarSource: {uri: 'https://picsum.photos/id/1027/100/100'},
    timeAgo: '5h ago',
    content:
      'Great meetup yesterday! Thanks to everyone who showed up for the maintenance workshop.',
    images: [{uri: 'https://picsum.photos/id/16/500/300'}],
    likeCount: 18,
    commentCount: 3,
    isSaved: true,
    isLiked: false,
    isCommented: true,
    labels: [{icon: 'users', text: 'Workshop'}],
  },
  {
    id: '3',
    userName: 'David Wilson',
    avatarSource: {uri: 'https://picsum.photos/id/1012/100/100'},
    timeAgo: 'Yesterday',
    content:
      "Who's joining the weekend ride? We'll be taking the coastal route!",
    images: [
      {uri: 'https://picsum.photos/id/10/500/300'},
      {uri: 'https://picsum.photos/id/11/500/300'},
    ],
    routeTitle: 'Coastal Weekend Ride',
    likeCount: 32,
    commentCount: 7,
    isSaved: false,
    isLiked: true,
    isCommented: false,
    labels: [
      {icon: 'clock', text: 'Upcoming Event'},
      {icon: 'map-pin', text: 'Pacific Coast'},
    ],
  },
  {
    id: '4',
    userName: 'Emma Roberts',
    avatarSource: {uri: 'https://picsum.photos/id/1014/100/100'},
    timeAgo: '2 days ago',
    content: "New bike day! Can't wait to ride with the group next weekend.",
    images: [{uri: 'https://picsum.photos/id/21/500/300'}],
    likeCount: 45,
    commentCount: 12,
    isSaved: true,
    isLiked: true,
    isCommented: false,
    labels: [{icon: 'wrench', text: 'New Bike'}],
  },
  {
    id: '5',
    userName: 'Michael Chen',
    avatarSource: {uri: 'https://picsum.photos/id/1025/100/100'},
    timeAgo: '3 days ago',
    content: 'Photos from our last group adventure. What an amazing day!',
    images: [
      {uri: 'https://picsum.photos/id/27/500/300'},
      {uri: 'https://picsum.photos/id/28/500/300'},
      {uri: 'https://picsum.photos/id/29/500/300'},
    ],
    likeCount: 37,
    commentCount: 8,
    isSaved: false,
    isLiked: false,
    isCommented: true,
    labels: [
      {icon: 'users', text: 'Group Adventure'},
      {icon: 'map-pin', text: 'Mountain Trails'},
    ],
  },
];

/**
 * GroupDetail Screen - Displays detailed information about a specific group
 */
export const GroupDetailScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'GroupDetail'>>();
  const route = useRoute<GroupDetailScreenRouteProp>();
  const {groupId} = route.params;
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>(groupFeedPosts);

  // Create animated scroll value to track scroll position
  const scrollY = useRef(new Animated.Value(0)).current;

  // Create interpolated values for animations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [150, 80],
    extrapolate: 'clamp',
  });

  const logoSize = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [100, 60],
    extrapolate: 'clamp',
  });

  const logoMarginTop = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [-50, -30],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 100],
    outputRange: [1, 0.6, 0.3],
    extrapolate: 'clamp',
  });

  // Use the useGetGroup hook to fetch the group data
  const {group} = useGetGroup(groupId);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(prev => !prev);
  };

  const renderDescription = () => {
    const description = group?.description || 'No description available';

    if (!description || description === 'No description available') {
      return <BodySmall style={styles.description}>{description}</BodySmall>;
    }

    if (isDescriptionExpanded) {
      return (
        <TouchableOpacity onPress={toggleDescription}>
          <BodySmall style={styles.description}>{description}</BodySmall>
          <BodySmall align="center" weight="bold" color={colors.neutral.black}>
            Show less
          </BodySmall>
        </TouchableOpacity>
      );
    }

    // Truncate description to ~3 lines
    const truncatedDescription =
      description.length > 100
        ? `${description.substring(0, 100)}...`
        : description;

    return (
      <TouchableOpacity onPress={toggleDescription}>
        <BodySmall style={styles.description}>{truncatedDescription}</BodySmall>
        {description.length > 100 && (
          <BodySmall align="center" weight="bold" color={colors.neutral.black}>
            Read more
          </BodySmall>
        )}
      </TouchableOpacity>
    );
  };

  // Handle like press with state update
  const handleLikePress = useCallback((postId: string) => {
    setPosts(currentPosts =>
      currentPosts.map(post =>
        post.id === postId ? {...post, isLiked: !post.isLiked} : post,
      ),
    );
  }, []);

  // Handle comment press
  const handleCommentPress = useCallback((postId: string) => {
    console.log(`Comment pressed for post: ${postId}`);
  }, []);

  // Handle save press with state update
  const handleSavePress = useCallback((postId: string) => {
    setPosts(currentPosts =>
      currentPosts.map(post =>
        post.id === postId ? {...post, isSaved: !post.isSaved} : post,
      ),
    );
  }, []);

  // Render feed post
  const renderFeedPost = useCallback(
    ({item}: {item: FeedPost}) => {
      return (
        <FeedCard
          avatarSource={item.avatarSource}
          userName={item.userName}
          timeAgo={item.timeAgo}
          labels={item.labels}
          content={item.content}
          images={item.images}
          routeTitle={item.routeTitle}
          likeCount={item.likeCount}
          commentCount={item.commentCount}
          isSaved={item.isSaved}
          isLiked={item.isLiked}
          isCommented={item.isCommented}
          onLikePress={() => handleLikePress(item.id)}
          onCommentPress={() => handleCommentPress(item.id)}
          onSavePress={() => handleSavePress(item.id)}
          style={styles.feedCard}
        />
      );
    },
    [handleLikePress, handleCommentPress, handleSavePress],
  );

  // Feed keyExtractor
  const feedKeyExtractor = useCallback((item: FeedPost) => item.id, []);

  return (
    <View style={styles.container}>
      <TopHeaderBar
        showBackButton
        backgroundColor="transparent"
        onBackPress={handleGoBack}
        rightIconName="more-vertical"
        containerStyle={styles.topHeaderBar}
      />
      <Animated.View
        style={[
          styles.imageContainer,
          {
            height: headerHeight,
            opacity: headerOpacity,
          },
        ]}>
        <Image
          source={{uri: group?.cover || ''}}
          style={styles.cover}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        <Animated.View
          style={[
            styles.logoContainer,
            {
              marginTop: logoMarginTop,
            },
          ]}>
          <Animated.Image
            source={{uri: group?.logo || ''}}
            style={[
              styles.logo,
              {
                width: logoSize,
                height: logoSize,
              },
            ]}
          />
        </Animated.View>
      </Animated.View>
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16} // Ensures smooth scrolling
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}>
        <View style={styles.infoContainer}>
          <Title align="center">{group?.name}</Title>

          <View style={styles.infoRow}>
            <Icon name="users-filled" size={18} />
            <Typography style={styles.infoText}>
              {group?.memberships?.length || 0} members
            </Typography>
            <View style={styles.dot} />
            <View style={styles.lockContainer}>
              <Icon
                name={
                  group?.privacy === 'PUBLIC' ? 'earth-filled' : 'lock-filled'
                }
                size={18}
              />
              <Typography style={styles.infoText}>
                {group?.privacy === 'PUBLIC' ? 'Public' : 'Private'} Group
              </Typography>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="map-pin" size={18} />
            <Typography style={styles.infoText}>
              {group?.city.value || 'No location'}
            </Typography>
          </View>

          <View style={styles.tagsContainer}>
            {group?.tags?.map((tag, index) => (
              <Chip
                variant="outlined"
                color="dark"
                size="small"
                key={index}
                label={tag.value}
              />
            ))}
          </View>

          <View style={styles.descriptionContainer}>{renderDescription()}</View>
        </View>
        <View style={styles.shortcutsContainer}>
          <Button
            iconPosition="top"
            iconName="plus"
            iconSize={24}
            variant="outline"
            size="medium"
            title="Create Post"
          />
          <Button
            iconPosition="top"
            iconName="route"
            iconSize={24}
            variant="dark"
            size="medium"
            title="Create Event"
          />
        </View>
        <View style={styles.content}>
          <Title>Recent Posts</Title>
          <LegendList
            data={posts}
            renderItem={renderFeedPost}
            keyExtractor={feedKeyExtractor}
            scrollEnabled={false}
            contentContainerStyle={styles.feedList}
            recycleItems={true} // Enable component recycling for better performance
            maintainVisibleContentPosition={true} // Maintain the visible position when data changes
          />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  topHeaderBar: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent overlay
  },
  logoContainer: {
    marginTop: -50,
    ...getShadow('medium'),
    zIndex: 1,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    borderRadius: radius.round,
  },
  scrollView: {
    flex: 1,
    paddingTop: 125,
  },
  infoContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: spacing.xs,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral.lightGrey,
    marginHorizontal: spacing.sm,
  },
  lockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  descriptionContainer: {
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  readMoreText: {
    textAlign: 'center',
  },
  shortcutsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.lg,
  },
  feedList: {
    paddingTop: spacing.md,
  },
  feedCard: {
    marginBottom: spacing.md,
  },
});
