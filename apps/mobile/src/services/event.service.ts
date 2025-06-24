import {gql} from '@apollo/client';
import {apolloClient} from '../configs/apolloClientConfig';
import {CreateEventFormValues} from '@utils/validation';
import {loggingService} from './logging.service';

// Event fragments
const EVENT_FRAGMENT = gql`
  fragment EventFields on Event {
    id
    title
    description
    location
    startLocation
    startDate
    endDate
    maxParticipants
    coverImage
    isPrivate
    createdAt
    eventType
    # Add other fields as needed
  }
`;

// Create Event
const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      ...EventFields
    }
  }
  ${EVENT_FRAGMENT}
`;

// User invitation fragment
const USER_INVITATION_FRAGMENT = gql`
  fragment UserInvitationFields on EventInvitation {
    id
    eventId
    status
    invitee {
      id
      firstName
      lastName
      avatar
    }
  }
`;

// Invite users to an event
const INVITE_USERS_TO_EVENT = gql`
  mutation InviteUsersToEvent($input: InviteUsersInput!) {
    inviteUsersToEvent(input: $input) {
      ...UserInvitationFields
    }
  }
  ${USER_INVITATION_FRAGMENT}
`;

export const eventService = {
  // Create a new event
  async createEvent(eventData: CreateEventFormValues): Promise<any> {
    try {
      // Format the data for the API
      const formattedData = {
        title: eventData.title,
        description: eventData.description,
        location: eventData.meetingPoint,
        startLocation: eventData.startLocation,
        startDate: new Date(
          `${eventData.startDate.toISOString().split('T')[0]}T${
            eventData.startTime.toISOString().split('T')[1]
          }`,
        ).toISOString(),
        endDate:
          eventData.endDate && eventData.endTime
            ? new Date(
                `${eventData.endDate.toISOString().split('T')[0]}T${
                  eventData.endTime.toISOString().split('T')[1]
                }`,
              ).toISOString()
            : null,
        maxParticipants: eventData.maxParticipants
          ? parseInt(eventData.maxParticipants as string, 10)
          : null,
        coverImage: eventData.images?.[0] || null,
        isPrivate: eventData.isPrivate,
        eventType: eventData.eventType,

        // Include specific fields based on event type
        details: {
          ...(eventData.routeDescription && {
            routeDescription: eventData.routeDescription,
          }),
          ...(eventData.roadType && {roadType: eventData.roadType}),
          ...(eventData.difficulty && {difficulty: eventData.difficulty}),
          ...(eventData.restStops && {restStops: eventData.restStops}),
          ...(eventData.overnightInfo && {
            overnightInfo: eventData.overnightInfo,
          }),
          ...(eventData.equipmentChecklist && {
            equipmentChecklist: eventData.equipmentChecklist,
          }),
          ...(eventData.instructorInfo && {
            instructorInfo: eventData.instructorInfo,
          }),
          ...(eventData.topicsCovered && {
            topicsCovered: eventData.topicsCovered,
          }),
          ...(eventData.experienceLevel && {
            experienceLevel: eventData.experienceLevel,
          }),
          ...(eventData.price && {price: eventData.price}),
        },

        // Include groups if any are invited
        invitedGroupIds: eventData.invitedGroups?.length
          ? eventData.invitedGroups
          : [],
      };

      const {data} = await apolloClient.mutate({
        mutation: CREATE_EVENT,
        variables: {
          input: formattedData,
        },
      });

      // If there are invited users, invite them after creating the event
      if (
        eventData.eventType === 'SOLO_RIDE' &&
        eventData.isPrivate &&
        eventData.invitedUsers?.length
      ) {
        await this.inviteUsersToEvent(
          data.createEvent.id,
          eventData.invitedUsers,
        );
      }

      return data.createEvent;
    } catch (error) {
      loggingService.error('Error creating event:', error);

      return null;
    }
  },

  // Invite users to an event
  async inviteUsersToEvent(eventId: string, userIds: string[]): Promise<any> {
    try {
      const {data} = await apolloClient.mutate({
        mutation: INVITE_USERS_TO_EVENT,
        variables: {
          input: {
            eventId,
            userIds,
          },
        },
      });
      return data.inviteUsersToEvent;
    } catch (error) {
      loggingService.error('Error inviting users to event:', error);
      return null;
    }
  },
};
