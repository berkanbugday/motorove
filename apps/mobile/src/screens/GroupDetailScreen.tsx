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
import {ButtonStyle, ButtonSize} from '../components/types/common';

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

const GroupDetailScreen: React.FC<GroupDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const {colors} = useTheme();
  const {groupId, groupName, groupImage} = route.params;

  useEffect(() => {
    navigation.setOptions({
      title: groupName,
    });
  }, [navigation, groupName]);

  const [groupData, setGroupData] = useState({
    name: groupName,
    description:
      'A group for motorcycle lovers to share experiences and organize rides together.',
    rules: [
      'Respect all members',
      'Share relevant content only',
      'No spam or advertisements',
    ],
    members: [
      {
        id: 1,
        name: 'John',
        surname: 'Doe',
        avatar: 'https://i.pravatar.cc/50?img=1',
        bio: 'Passionate rider exploring the world on two wheels',
        motorcycle: {
          brand: 'Yamaha',
          model: 'MT-07',
        },
        drivingSince: '2020',
      },
      {
        id: 2,
        name: 'Jane',
        surname: 'Smith',
        avatar: 'https://i.pravatar.cc/50?img=2',
        bio: 'Adventure seeker and weekend warrior',
        motorcycle: {
          brand: 'Kawasaki',
          model: 'Ninja 650',
        },
        drivingSince: '2018',
      },
      {
        id: 3,
        name: 'Mike',
        surname: 'Johnson',
        avatar: 'https://i.pravatar.cc/50?img=3',
        bio: 'Track day enthusiast and motorcycle mechanic',
        motorcycle: {
          brand: 'Honda',
          model: 'CBR650R',
        },
        drivingSince: '2019',
      },
      {
        id: 4,
        name: 'Sarah',
        surname: 'Wilson',
        avatar: 'https://i.pravatar.cc/50?img=4',
        bio: 'Long-distance touring enthusiast',
        motorcycle: {
          brand: 'BMW',
          model: 'R1250GS',
        },
        drivingSince: '2015',
      },
      {
        id: 5,
        name: 'David',
        surname: 'Brown',
        avatar: 'https://i.pravatar.cc/50?img=5',
        bio: 'Cafe racer builder and vintage bike collector',
        motorcycle: {
          brand: 'Triumph',
          model: 'Thruxton RS',
        },
        drivingSince: '2010',
      },
      {
        id: 6,
        name: 'Emma',
        surname: 'Davis',
        avatar: 'https://i.pravatar.cc/50?img=6',
        bio: 'Motovlogger and community organizer',
        motorcycle: {
          brand: 'Ducati',
          model: 'Monster 937',
        },
        drivingSince: '2019',
      },
      {
        id: 7,
        name: 'Alex',
        surname: 'Martinez',
        avatar: 'https://i.pravatar.cc/50?img=7',
        bio: 'Stunt rider and instructor',
        motorcycle: {
          brand: 'KTM',
          model: '690 Duke',
        },
        drivingSince: '2016',
      },
      {
        id: 8,
        name: 'Lisa',
        surname: 'Taylor',
        avatar: 'https://i.pravatar.cc/50?img=8',
        bio: 'Off-road adventure enthusiast',
        motorcycle: {
          brand: 'KTM',
          model: '390 Adventure',
        },
        drivingSince: '2021',
      },
      {
        id: 9,
        name: 'Ryan',
        surname: 'Anderson',
        avatar: 'https://i.pravatar.cc/50?img=9',
        bio: 'Track day coach and racer',
        motorcycle: {
          brand: 'Aprilia',
          model: 'RS 660',
        },
        drivingSince: '2012',
      },
      {
        id: 10,
        name: 'Sophie',
        surname: 'Clark',
        avatar: 'https://i.pravatar.cc/50?img=10',
        bio: 'City commuter and weekend explorer',
        motorcycle: {
          brand: 'Triumph',
          model: 'Street Triple',
        },
        drivingSince: '2020',
      },
      {
        id: 11,
        name: 'Tom',
        surname: 'White',
        avatar: 'https://i.pravatar.cc/50?img=11',
        bio: 'Custom bike builder and mechanic',
        motorcycle: {
          brand: 'Harley-Davidson',
          model: 'Sportster',
        },
        drivingSince: '2008',
      },
      {
        id: 12,
        name: 'Maria',
        surname: 'Garcia',
        avatar: 'https://i.pravatar.cc/50?img=12',
        bio: 'Group ride organizer and safety instructor',
        motorcycle: {
          brand: 'Suzuki',
          model: 'SV650',
        },
        drivingSince: '2017',
      },
      {
        id: 13,
        name: 'Chris',
        surname: 'Lee',
        avatar: 'https://i.pravatar.cc/50?img=13',
        bio: 'Sport touring enthusiast',
        motorcycle: {
          brand: 'Yamaha',
          model: 'Tracer 9 GT',
        },
        drivingSince: '2014',
      },
      {
        id: 14,
        name: 'Anna',
        surname: 'Moore',
        avatar: 'https://i.pravatar.cc/50?img=14',
        bio: 'Beginner rider and photography enthusiast',
        motorcycle: {
          brand: 'Honda',
          model: 'Rebel 500',
        },
        drivingSince: '2023',
      },
      {
        id: 15,
        name: 'James',
        surname: 'Wilson',
        avatar: 'https://i.pravatar.cc/50?img=15',
        bio: 'Mountain road specialist',
        motorcycle: {
          brand: 'Ducati',
          model: 'Panigale V2',
        },
        drivingSince: '2016',
      },
      {
        id: 16,
        name: 'Nina',
        surname: 'Patel',
        avatar: 'https://i.pravatar.cc/50?img=16',
        bio: 'Urban commuter and coffee run enthusiast',
        motorcycle: {
          brand: 'Vespa',
          model: 'GTS 300',
        },
        drivingSince: '2022',
      },
      {
        id: 17,
        name: 'Peter',
        surname: 'Chang',
        avatar: 'https://i.pravatar.cc/50?img=17',
        bio: 'Track day regular and tire tester',
        motorcycle: {
          brand: 'BMW',
          model: 'S1000RR',
        },
        drivingSince: '2013',
      },
      {
        id: 18,
        name: 'Laura',
        surname: 'Martinez',
        avatar: 'https://i.pravatar.cc/50?img=18',
        bio: 'Adventure rider and camping enthusiast',
        motorcycle: {
          brand: 'Triumph',
          model: 'Tiger 900',
        },
        drivingSince: '2019',
      },
      {
        id: 19,
        name: 'Kevin',
        surname: 'Thompson',
        avatar: 'https://i.pravatar.cc/50?img=19',
        bio: 'Vintage bike restorer',
        motorcycle: {
          brand: 'Norton',
          model: 'Commando',
        },
        drivingSince: '2005',
      },
      {
        id: 20,
        name: 'Rachel',
        surname: 'Adams',
        avatar: 'https://i.pravatar.cc/50?img=20',
        bio: 'Motorcycle journalist and reviewer',
        motorcycle: {
          brand: 'MV Agusta',
          model: 'Brutale',
        },
        drivingSince: '2015',
      },
      {
        id: 21,
        name: 'Daniel',
        surname: 'Kim',
        avatar: 'https://i.pravatar.cc/50?img=21',
        bio: 'Electric motorcycle enthusiast',
        motorcycle: {
          brand: 'Zero',
          model: 'SR/F',
        },
        drivingSince: '2020',
      },
      {
        id: 22,
        name: 'Isabella',
        surname: 'Romano',
        avatar: 'https://i.pravatar.cc/50?img=22',
        bio: 'Scooter commuter turned sport rider',
        motorcycle: {
          brand: 'Aprilia',
          model: 'Tuono 660',
        },
        drivingSince: '2021',
      },
      {
        id: 23,
        name: 'George',
        surname: 'Walker',
        avatar: 'https://i.pravatar.cc/50?img=23',
        bio: 'Cruiser enthusiast and long-distance rider',
        motorcycle: {
          brand: 'Indian',
          model: 'Chief',
        },
        drivingSince: '2011',
      },
      {
        id: 24,
        name: 'Olivia',
        surname: 'Green',
        avatar: 'https://i.pravatar.cc/50?img=24',
        bio: 'Motorcycle safety advocate',
        motorcycle: {
          brand: 'Kawasaki',
          model: 'Versys 650',
        },
        drivingSince: '2018',
      },
      {
        id: 25,
        name: 'Marcus',
        surname: 'Bell',
        avatar: 'https://i.pravatar.cc/50?img=25',
        bio: 'Supermoto rider and stunt enthusiast',
        motorcycle: {
          brand: 'Husqvarna',
          model: '701 Supermoto',
        },
        drivingSince: '2017',
      },
      {
        id: 26,
        name: 'Hannah',
        surname: 'Foster',
        avatar: 'https://i.pravatar.cc/50?img=26',
        bio: 'New rider mentor and community leader',
        motorcycle: {
          brand: 'Royal Enfield',
          model: 'Continental GT',
        },
        drivingSince: '2019',
      },
      {
        id: 27,
        name: 'Victor',
        surname: 'Nguyen',
        avatar: 'https://i.pravatar.cc/50?img=27',
        bio: 'Track day photographer and rider',
        motorcycle: {
          brand: 'Yamaha',
          model: 'R7',
        },
        drivingSince: '2016',
      },
      {
        id: 28,
        name: 'Sophia',
        surname: 'Carter',
        avatar: 'https://i.pravatar.cc/50?img=28',
        bio: 'Motorcycle camping enthusiast',
        motorcycle: {
          brand: 'Moto Guzzi',
          model: 'V85 TT',
        },
        drivingSince: '2020',
      },
      {
        id: 29,
        name: 'Lucas',
        surname: 'Santos',
        avatar: 'https://i.pravatar.cc/50?img=29',
        bio: 'Urban explorer and night rider',
        motorcycle: {
          brand: 'Ducati',
          model: 'Streetfighter V4',
        },
        drivingSince: '2015',
      },
      {
        id: 30,
        name: 'Elena',
        surname: 'Cooper',
        avatar: 'https://i.pravatar.cc/50?img=30',
        bio: 'Vintage scooter collector and restorer',
        motorcycle: {
          brand: 'Lambretta',
          model: 'GP200',
        },
        drivingSince: '2012',
      },
    ],
    eventInfo: {
      nextEvent: 'Weekend Ride',
      date: '2024-03-15',
      participants: 12,
    },
  });

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

  const handleChatPress = (memberId: number) => {
    // Handle chat button press
    console.log('Chat pressed for member:', memberId);
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
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
    membersContainer: {
      marginTop: 16,
    },
    membersList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    memberItem: {
      alignItems: 'center',
      width: width / 4 - 16,
      marginBottom: 16,
    },
    memberAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginBottom: 4,
    },
    memberName: {
      fontSize: 12,
      textAlign: 'center',
      color: colors.text,
    },
  });
  return (
    <ScrollView style={styles.container}>
      <View style={styles.thumbnailContainer}>
        <Image source={groupImage} style={styles.thumbnail} />
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditThumbnail}>
          <Icon name="pencil" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.avatarContainer}>
          <Image source={groupImage} style={styles.avatar} />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.groupName}>{groupData.name}</Text>
        <Text style={styles.description}>{groupData.description}</Text>

        <Text style={styles.sectionTitle}>Group Rules</Text>
        {groupData.rules.map((rule, index) => (
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
              {groupData.eventInfo.nextEvent}
            </Text>
            <Text style={styles.eventText}>{groupData.eventInfo.date}</Text>
          </View>
          <Text style={styles.eventText}>
            {groupData.eventInfo.participants} participants
          </Text>
        </View>

        <View style={styles.membersContainer}>
          <Text style={styles.sectionTitle}>Members</Text>
          <MemberStackedList
            layout="vertical"
            members={groupData.members.map(renderMemberItem)}
            onMemberPress={index =>
              console.log('Member pressed:', groupData.members[index].id)
            }
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default GroupDetailScreen;
