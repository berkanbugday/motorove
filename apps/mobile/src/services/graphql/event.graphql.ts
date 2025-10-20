import {gql} from '@apollo/client';

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
    }
    addresses {
      id
      language
      address
      type
      latitude
      longitude
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
