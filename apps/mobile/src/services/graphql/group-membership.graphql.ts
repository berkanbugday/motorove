import {gql} from '@apollo/client';
import {USER_FRAGMENT} from './user.graphql';

// GroupMembership fragment
export const GROUP_MEMBERSHIP_FRAGMENT = gql`
  fragment GroupMembershipFragment on GroupMembershipDto {
    id
    group {
      id
      name
    }
    user {
      ...UserFragment
    }
    role
    status
    createdAt
    updatedAt
  }
  ${USER_FRAGMENT}
`;

// Add a member to a group
export const ADD_MEMBER = gql`
  mutation AddMember($input: AddMemberInput!) {
    addMember(input: $input)
  }
`;

// Remove a member from a group
export const REMOVE_MEMBER = gql`
  mutation RemoveMember($input: RemoveMemberInput!) {
    removeMember(input: $input)
  }
`;

// Change a member's role
export const CHANGE_MEMBER_ROLE = gql`
  mutation ChangeMemberRole($input: ChangeMemberRoleInput!) {
    changeMemberRole(input: $input)
  }
`;

export const UPDATE_GROUP_MEMBERSHIP_INVITATION_STATUS = gql`
  mutation UpdateGroupMembershipInvitationStatus(
    $input: UpdateGroupMembershipInvitationStatusInput!
  ) {
    updateGroupMembershipInvitationStatus(input: $input) {
      status
    }
  }
`;

export const GET_GROUP_JOIN_REQUESTS = gql`
  query GetGroupJoinRequests($limit: Int, $skip: Int) {
    groupJoinRequests(limit: $limit, skip: $skip) {
      ...GroupMembershipFragment
    }
  }
  ${GROUP_MEMBERSHIP_FRAGMENT}
`;
