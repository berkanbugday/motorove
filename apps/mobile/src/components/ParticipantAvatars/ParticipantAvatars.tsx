import React from 'react';
import {
  View,
  Image,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import {Typography} from '../Typography';
import {colors, getShadow} from '@theme';
import {IEventParticipant} from '@motorove/shared';
import {
  closeBottomSheet,
  useBottomSheet,
} from '../BottomSheet/BottomSheetProvider';
import {ParticipantsList} from '../ParticipantsList';
import {styles} from './ParticipantAvatars.styles';
import {useTranslation} from '@hooks/useTranslation';

// Generic participant interface for flexibility
export interface BaseParticipant {
  id: string;
  avatar?: string;
  name?: string;
  createdBy?: {
    id: string;
    avatar?: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface ParticipantAvatarsProps {
  /**
   * List of participants (can be IEventParticipant or ParticipantInfo)
   */
  participants: BaseParticipant[] | IEventParticipant[];

  /**
   * Maximum number of avatars to display before showing "+X"
   * @default 4
   */
  maxAvatars?: number;

  /**
   * Size of the avatars
   * @default 30
   */
  avatarSize?: number;

  /**
   * Overlap amount between avatars (negative margin)
   * @default -8
   */
  overlapAmount?: number;

  /**
   * Additional styles for the container
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Callback when a participant is pressed
   */
  onParticipantPress?: (
    participant: BaseParticipant | IEventParticipant,
  ) => void;
}

/**
 * ParticipantAvatars Component
 *
 * Displays participant avatars in an overlapping layout with a "+X" indicator
 * for additional participants. Follows the Single Responsibility Principle
 * by handling only avatar display logic.
 */
export const ParticipantAvatars: React.FC<ParticipantAvatarsProps> = ({
  participants,
  maxAvatars = 4,
  avatarSize = 30,
  overlapAmount = -8,
  style,
  onParticipantPress,
}) => {
  const {openBottomSheet} = useBottomSheet();
  const {t} = useTranslation();

  const handlePress = () => {
    if (participants.length === 0) {
      return;
    }

    openBottomSheet({
      content: (
        <ParticipantsList
          participants={participants}
          onParticipantPress={participant => {
            closeBottomSheet();
            onParticipantPress?.(participant);
          }}
        />
      ),
      snapPoint: 'partial',
      title: t('components.participantsList.title'),
      subtitle: t('components.participantsList.subtitle', {
        count: participants.length,
      }),
      showCloseButton: true,
      closeButtonPosition: 'top-right',
      closeOnBackdropPress: true,
    });
  };
  // Early return if no participants
  if (!participants || participants.length === 0) {
    return null;
  }

  const displayedParticipantsCount = Math.min(participants.length, maxAvatars);
  const remainingParticipants = Math.max(
    0,
    participants.length - displayedParticipantsCount,
  );

  const avatarContainerStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    ...getShadow('small'),
  };

  const avatarImageStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    borderWidth: 1,
    borderColor: colors.neutral.black,
    backgroundColor: colors.neutral.white,
  };

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
      };
    }
    // Handle ParticipantInfo (direct properties)
    return {
      id: participant.id,
      avatar: participant.avatar,
      name: participant.name || '',
    };
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View style={[styles.container, style]}>
        <View style={styles.avatarsContainer}>
          {participants
            .slice(0, displayedParticipantsCount)
            .map((participant, index) => {
              const participantData = getParticipantData(participant);
              return (
                <View
                  key={participantData.id}
                  style={[
                    avatarContainerStyle,
                    {
                      zIndex: 10 - index,
                      marginLeft: index > 0 ? overlapAmount : 0,
                    },
                  ]}>
                  <Image
                    source={
                      participantData.avatar
                        ? {uri: participantData.avatar}
                        : require('@assets/images/default_avatar.png')
                    }
                    style={avatarImageStyle}
                  />
                </View>
              );
            })}

          {remainingParticipants > 0 && (
            <View
              style={[
                avatarContainerStyle,
                styles.remainingAvatars,
                {
                  marginLeft:
                    displayedParticipantsCount > 0 ? overlapAmount : 0,
                },
              ]}>
              <Typography
                variant="caption"
                color={colors.neutral.white}
                align="center"
                style={styles.remainingText}>
                +{remainingParticipants}
              </Typography>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ParticipantAvatars;
