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
    images
    addresses {
      id
      language
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
    participantsCount
    isParticipating
    participationStatus
    createdBy {
      id
      firstName
      lastName
      avatar
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
export const USER_INVITATION_FRAGMENT = gql`
  fragment UserInvitationFragment on EventInvitation {
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

// Invite users to an event
export const INVITE_USERS_TO_EVENT = gql`
  mutation InviteUsersToEvent($input: InviteUsersInput!) {
    inviteUsersToEvent(input: $input) {
      ...UserInvitationFragment
    }
  }
  ${USER_INVITATION_FRAGMENT}
`;

// Get events query
export const GET_EVENTS = gql`
  query GetEvents($limit: Int, $skip: Int, $status: EventStatus) {
    events(limit: $limit, skip: $skip, status: $status) {
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

// Get event join requests
export const GET_EVENT_JOIN_REQUESTS = gql`
  query GetEventJoinRequests($eventId: String!, $limit: Int, $skip: Int) {
    eventJoinRequests(eventId: $eventId, limit: $limit, skip: $skip) {
      id
      event {
        id
        title
      }
      user {
        id
        firstName
        lastName
        avatar
      }
      status
      createdAt
    }
  }
`;

// Accept event join request
export const ACCEPT_EVENT_JOIN_REQUEST = gql`
  mutation AcceptEventJoinRequest($id: String!) {
    acceptEventJoinRequest(id: $id) {
      id
      status
    }
  }
`;

// Reject event join request
export const REJECT_EVENT_JOIN_REQUEST = gql`
  mutation RejectEventJoinRequest($id: String!) {
    rejectEventJoinRequest(id: $id) {
      id
      status
    }
  }
`;
