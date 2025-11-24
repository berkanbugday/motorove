import {gql} from '@apollo/client';
import {GROUP_FRAGMENT} from './group.graphql';

export const EVENT_ADDRESS_FRAGMENT = gql`
  fragment EventAddressFragment on EventAddressDto {
    id
    address
    countryCode
    language
    type
    latitude
    longitude
  }
`;

// Event fragment
export const EVENT_FRAGMENT = gql`
  fragment EventFragment on EventDto {
    id
    title
    description
    eventType
    status
    startDateTime
    endDateTime
    maxParticipants
    isPrivate
    images {
      url
      isCensored
      order
    }
    addresses {
      ...EventAddressFragment
    }
    roadType
    difficultyLevel
    routeDescription
    restStops
    campingInfo
    equipmentChecklist
    instructorInfo
    topicsCovered
    experienceLevel
    price
    currency
    distanceKm
    durationSeconds
    participantsCount
    isParticipating
    participationStatus
    participants {
      id
      createdBy {
        id
        firstName
        lastName
        avatar
      }
    }
    organizedByGroup {
      id
      name
    }
    invitedUsers {
      id
      firstName
      lastName
    }
    invitedGroups {
      ...GroupFragment
    }
    createdBy {
      id
      firstName
      lastName
    }
    createdById
    createdAt
    updatedBy {
      id
      firstName
      lastName
    }
    updatedById
    updatedAt
    isActive
  }
  ${EVENT_ADDRESS_FRAGMENT}
  ${GROUP_FRAGMENT}
`;

// User invitation fragment
export const EVENT_INVITATION_FRAGMENT = gql`
  fragment EventInvitationFragment on EventInvitationDto {
    id
    event {
      id
      title
      createdAt
      updatedAt
      images {
        url
        isCensored
        order
      }
      createdBy {
        id
        firstName
        lastName
      }
      organizedByGroup {
        id
        name
      }
    }
  }
`;

// Create event mutation
export const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      ...EventFragment
    }
  }
  ${EVENT_FRAGMENT}
`;

// Update event mutation
export const UPDATE_EVENT = gql`
  mutation UpdateEvent($input: UpdateEventInput!) {
    updateEvent(input: $input) {
      ...EventFragment
    }
  }
  ${EVENT_FRAGMENT}
`;

// Remove event mutation
export const REMOVE_EVENT = gql`
  mutation RemoveEvent($id: ID!) {
    removeEvent(id: $id)
  }
`;

// Cancel event mutation
export const CANCEL_EVENT = gql`
  mutation CancelEvent($id: ID!) {
    cancelEvent(id: $id)
  }
`;

// Get events query
export const GET_EVENTS = gql`
  query GetEvents(
    $limit: Int
    $skip: Int
    $status: EventStatus
    $groupId: String
  ) {
    events(limit: $limit, skip: $skip, status: $status, groupId: $groupId) {
      ...EventFragment
    }
  }
  ${EVENT_FRAGMENT}
`;

// Get event by ID query
export const GET_EVENT = gql`
  query GetEvent($id: String!) {
    event(id: $id) {
      ...EventFragment
    }
  }
  ${EVENT_FRAGMENT}
`;

// Get event invitations
export const GET_EVENT_INVITATIONS = gql`
  query GetEventInvitations($limit: Int, $skip: Int) {
    eventInvitations(limit: $limit, skip: $skip) {
      ...EventInvitationFragment
    }
  }
  ${EVENT_INVITATION_FRAGMENT}
`;

// Accept event invitation
export const ACCEPT_EVENT_INVITATION = gql`
  mutation AcceptEventInvitation($id: ID!) {
    acceptEventInvitation(id: $id)
  }
`;

// Reject event invitation
export const REJECT_EVENT_INVITATION = gql`
  mutation RejectEventInvitation($id: ID!) {
    rejectEventInvitation(id: $id)
  }
`;

// Join event mutation
export const JOIN_EVENT = gql`
  mutation JoinEvent($id: ID!) {
    joinEvent(id: $id) {
      ...EventFragment
    }
  }
  ${EVENT_FRAGMENT}
`;

// Leave event mutation
export const LEAVE_EVENT = gql`
  mutation LeaveEvent($id: ID!) {
    leaveEvent(id: $id) {
      ...EventFragment
    }
  }
  ${EVENT_FRAGMENT}
`;
