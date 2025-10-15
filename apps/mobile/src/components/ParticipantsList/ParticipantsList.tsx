import React from 'react';
import {View, FlatList, Image, TouchableOpacity} from 'react-native';
import {Typography} from '../Typography';
import {IEventParticipant} from '@motorove/shared';
import {BaseParticipant} from '../ParticipantAvatars/ParticipantAvatars';
import {styles} from './ParticipantsList.styles';
import {useTranslation} from '@hooks/useTranslation';

export interface ParticipantsListProps {
  /**
   * List of participants (can be IEventParticipant or BaseParticipant)
   */
  participants: BaseParticipant[] | IEventParticipant[];

  /**
   * Callback when a participant is pressed
   */
  onParticipantPress?: (
    participant: BaseParticipant | IEventParticipant,
  ) => void;
}

/**
 * ParticipantsList Component
 *
 * Displays a list of participants with their avatars and names
 */
export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  onParticipantPress,
}) => {
  const {t} = useTranslation();
  // Helper function to get participant data
  const getParticipantData = (participant: any) => {
    // Handle IEventParticipant (has createdBy)
    if (participant.createdBy) {
      return {
        id: participant.createdBy.id,
        avatar: participant.createdBy.avatar,
        name: `${participant.createdBy.firstName || ''} ${
          participant.createdBy.lastName || ''
        }`.trim(),
        participant: participant,
      };
    }
    // Handle BaseParticipant (direct properties)
    return {
      id: participant.id,
      avatar: participant.avatar,
      name: participant.name || '',
      participant: participant,
    };
  };

  const renderParticipant = ({
    item,
  }: {
    item: BaseParticipant | IEventParticipant;
  }) => {
    const participantData = getParticipantData(item);

    return (
      <TouchableOpacity
        style={styles.participantItem}
        onPress={() => onParticipantPress?.(participantData.participant)}
        activeOpacity={0.7}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              participantData.avatar
                ? {uri: participantData.avatar}
                : require('@assets/images/default_avatar.png')
            }
            style={styles.avatar}
          />
        </View>
        <View style={styles.participantInfo}>
          <Typography variant="body" style={styles.participantName}>
            {participantData.name ||
              t('components.participantsList.unknown_user')}
          </Typography>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={participants}
        renderItem={renderParticipant}
        keyExtractor={(item, index) => {
          const participantData = getParticipantData(item);
          return participantData.id || index.toString();
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default ParticipantsList;
