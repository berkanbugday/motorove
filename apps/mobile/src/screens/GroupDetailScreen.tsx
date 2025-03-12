import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {MemberStackedList} from '../components/common/MemberStackedList';
import {Card} from '../components/common/Card';
import {TabBar} from '../components/common/TabBar';
import {Header} from '../components/common/Header';

const {width} = Dimensions.get('window');

interface Member {
  id: number;
  name: string;
  surname: string;
  avatar: string;
  bio: string;
  motorcycle: {
    brand: string;
    model: string;
  };
  drivingSince: string;
}

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  image: {uri: string};
  likes: number;
  comments: number;
  timestamp: string;
  tags: Array<{id: string; label: string}>;
}

interface GroupDetailScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<
    {
      params: {
        groupId: string;
        groupName: string;
        groupImage: {uri: string};
      };
    },
    'params'
  >;
}

const TAB_ITEMS = ['Posts', 'Members'];

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: {
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/50?img=1',
    },
    content: 'Just got my new Yamaha MT-07! Ready for some weekend rides! 🏍️',
    image: {uri: 'https://picsum.photos/800/600?random=1'},
    likes: 45,
    comments: 12,
    timestamp: '2h ago',
    tags: [
      {id: 'newbike', label: 'New Bike'},
      {id: 'yamaha', label: 'Yamaha'},
    ],
  },
  {
    id: '2',
    author: {
      name: 'Jane Smith',
      avatar: 'https://i.pravatar.cc/50?img=2',
    },
    content:
      'Great group ride today through the mountains! Thanks everyone who joined! 🏔️',
    image: {uri: 'https://picsum.photos/800/600?random=2'},
    likes: 78,
    comments: 23,
    timestamp: '5h ago',
    tags: [
      {id: 'groupride', label: 'Group Ride'},
      {id: 'mountains', label: 'Mountains'},
    ],
  },
  {
    id: '3',
    author: {
      name: 'Mike Johnson',
      avatar: 'https://i.pravatar.cc/50?img=3',
    },
    content: "Track day preparations! Can't wait for tomorrow! 🏁",
    image: {uri: 'https://picsum.photos/800/600?random=3'},
    likes: 92,
    comments: 34,
    timestamp: '8h ago',
    tags: [
      {id: 'trackday', label: 'Track Day'},
      {id: 'racing', label: 'Racing'},
    ],
  },
  {
    id: '4',
    author: {
      name: 'Sarah Wilson',
      avatar: 'https://i.pravatar.cc/50?img=4',
    },
    content: 'Beautiful sunset ride with my new BMW R1250GS 🌅',
    image: {uri: 'https://picsum.photos/800/600?random=4'},
    likes: 156,
    comments: 45,
    timestamp: '1d ago',
    tags: [
      {id: 'sunset', label: 'Sunset'},
      {id: 'bmw', label: 'BMW'},
    ],
  },
  {
    id: '5',
    author: {
      name: 'David Brown',
      avatar: 'https://i.pravatar.cc/50?img=5',
    },
    content:
      'Finally finished restoring my vintage Triumph! What do you think? 🛠️',
    image: {uri: 'https://picsum.photos/800/600?random=5'},
    likes: 234,
    comments: 67,
    timestamp: '2d ago',
    tags: [
      {id: 'vintage', label: 'Vintage'},
      {id: 'triumph', label: 'Triumph'},
    ],
  },
  {
    id: '6',
    author: {
      name: 'Emma Davis',
      avatar: 'https://i.pravatar.cc/50?img=6',
    },
    content: "New vlog is up! Check out our group's mountain adventure! 🎥",
    image: {uri: 'https://picsum.photos/800/600?random=6'},
    likes: 189,
    comments: 42,
    timestamp: '3d ago',
    tags: [
      {id: 'vlog', label: 'Vlog'},
      {id: 'adventure', label: 'Adventure'},
    ],
  },
  {
    id: '7',
    author: {
      name: 'Alex Martinez',
      avatar: 'https://i.pravatar.cc/50?img=7',
    },
    content: 'Stunt practice day! Learning new tricks 🤘',
    image: {uri: 'https://picsum.photos/800/600?random=7'},
    likes: 145,
    comments: 38,
    timestamp: '4d ago',
    tags: [
      {id: 'stunts', label: 'Stunts'},
      {id: 'practice', label: 'Practice'},
    ],
  },
  {
    id: '8',
    author: {
      name: 'Lisa Taylor',
      avatar: 'https://i.pravatar.cc/50?img=8',
    },
    content: 'Off-road adventures with my KTM! Love this bike! 🏔️',
    image: {uri: 'https://picsum.photos/800/600?random=8'},
    likes: 167,
    comments: 29,
    timestamp: '5d ago',
    tags: [
      {id: 'offroad', label: 'Off-road'},
      {id: 'ktm', label: 'KTM'},
    ],
  },
  {
    id: '9',
    author: {
      name: 'Ryan Anderson',
      avatar: 'https://i.pravatar.cc/50?img=9',
    },
    content: "Race day prep complete! Ready for tomorrow's track event! 🏁",
    image: {uri: 'https://picsum.photos/800/600?random=9'},
    likes: 198,
    comments: 56,
    timestamp: '6d ago',
    tags: [
      {id: 'racing', label: 'Racing'},
      {id: 'trackday', label: 'Track Day'},
    ],
  },
  {
    id: '10',
    author: {
      name: 'Sophie Clark',
      avatar: 'https://i.pravatar.cc/50?img=10',
    },
    content: 'City lights and night rides 🌃',
    image: {uri: 'https://picsum.photos/800/600?random=10'},
    likes: 223,
    comments: 48,
    timestamp: '1w ago',
    tags: [
      {id: 'nightride', label: 'Night Ride'},
      {id: 'citylife', label: 'City Life'},
    ],
  },
];

const GroupDetailScreen: React.FC<GroupDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const {colors} = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [groupData, _setGroupData] = useState<any>(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleEditThumbnail = () => {
    Alert.alert('Edit Thumbnail', 'Choose an option', [
      {text: 'Take Photo', onPress: () => console.log('Take Photo')},
      {
        text: 'Choose from Library',
        onPress: () => console.log('Choose from Library'),
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const renderMemberItem = (member: Member) => ({
    id: member.id,
    avatar: member.avatar,
    name: member.name,
    surname: member.surname,
    tags: [
      {
        id: 'motorcycle',
        label: `${member.motorcycle.brand} ${member.motorcycle.model}`,
      },
      {id: 'experience', label: `Since ${member.drivingSince}`},
    ],
    rightButton: {
      label: 'Following',
      style: 'outline' as const,
      onPress: () => console.log('Following member:', member.id),
    },
  });

  const renderPost = (post: Post) => (
    <Card
      key={post.id}
      image={post.image}
      imageStyle="square"
      imageSize="large"
      title={post.author.name}
      subtitle={post.timestamp}
      description={post.content}
      tags={post.tags}
      layout="vertical"
      button={{
        label: `${post.likes} Likes • ${post.comments} Comments`,
        style: 'round',
        size: 'small',
        onPress: () => console.log('Post pressed:', post.id),
      }}
    />
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    scrollContainer: {
      flexGrow: 1,
    },
    thumbnailContainer: {
      width: width,
      height: 200,
      position: 'relative',
    },
    thumbnail: {
      width: '100%',
      height: '100%',
    },
    editButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
      padding: 8,
    },
    avatarContainer: {
      position: 'absolute',
      bottom: -40,
      alignSelf: 'center',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: colors.background,
    },
    contentContainer: {
      paddingTop: 50,
      paddingHorizontal: 16,
    },
    groupName: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
      color: colors.text,
    },
    description: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 24,
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: colors.text,
    },
    ruleItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    ruleText: {
      marginLeft: 8,
      fontSize: 14,
      color: colors.text,
    },
    eventCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginVertical: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    eventInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    eventText: {
      fontSize: 14,
      color: colors.text,
    },
    tabContent: {
      flex: 1,
      paddingHorizontal: 16,
    },
    postsContainer: {
      paddingVertical: 16,
    },
    membersContainer: {
      paddingVertical: 16,
    },
  });

  return (
    <View style={styles.container}>
      <Header
        title={route.params.groupName}
        leftComponent={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#000000" />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity onPress={() => console.log('More options')}>
            <Icon name="dots-vertical" size={24} color="#000000" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.thumbnailContainer}>
          <Image source={route.params.groupImage} style={styles.thumbnail} />
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditThumbnail}>
            <Icon name="pencil" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            <Image source={route.params.groupImage} style={styles.avatar} />
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.groupName}>{route.params.groupName}</Text>
          <Text style={styles.description}>
            A group for motorcycle lovers to share experiences and organize
            rides together.
          </Text>

          <Text style={styles.sectionTitle}>Group Rules</Text>
          {groupData?.rules.map((rule: string, index: number) => (
            <View key={index} style={styles.ruleItem}>
              <Icon
                name="checkbox-marked-circle"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}

          <View style={styles.eventCard}>
            <Text style={styles.sectionTitle}>Next Event</Text>
            <View style={styles.eventInfo}>
              <Text style={styles.eventText}>
                {groupData?.eventInfo.nextEvent}
              </Text>
              <Text style={styles.eventText}>{groupData?.eventInfo.date}</Text>
            </View>
            <Text style={styles.eventText}>
              {groupData?.eventInfo.participants} participants
            </Text>
          </View>
        </View>

        <TabBar
          items={TAB_ITEMS}
          selectedIndex={selectedTab}
          onTabPress={setSelectedTab}
        />

        {selectedTab === 0 ? (
          <View style={styles.postsContainer}>
            {MOCK_POSTS.map(post => renderPost(post))}
          </View>
        ) : (
          <View style={styles.membersContainer}>
            <MemberStackedList
              layout="vertical"
              members={groupData?.members.map(renderMemberItem)}
              onMemberPress={index =>
                console.log('Member pressed:', groupData?.members[index].id)
              }
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default GroupDetailScreen;
