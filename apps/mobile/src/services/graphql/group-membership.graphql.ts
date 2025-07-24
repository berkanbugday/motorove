import {gql} from '@apollo/client';
import {USER_FRAGMENT} from './user.graphql';

// GroupMembership fragment
export const GROUP_MEMBERSHIP_FRAGMENT = gql`
  fragment GroupMembershipFragment on GroupMembershipDto {
    id
    groupId
    user {
      ...UserFragment
    }
    role
    status
    joinedAt
  }
  ${USER_FRAGMENT}
`;

// Get all group memberships
export const GET_GROUP_MEMBERSHIPS = gql`
  query GetGroupMemberships {
    groupMemberships {
      ...GroupMembershipFragment
    }
  }
  ${GROUP_MEMBERSHIP_FRAGMENT}
`;

// Get members of a specific group
export const GET_GROUP_MEMBERS = gql`
  query GetGroupMembers($groupId: String!) {
    groupMembers(groupId: $groupId) {
      ...GroupMembershipFragment
    }
  }
  ${GROUP_MEMBERSHIP_FRAGMENT}
`;

// Get current user's group memberships
export const GET_MY_GROUP_MEMBERSHIPS = gql`
  query GetMyGroupMemberships {
    myGroupMemberships {
      ...GroupMembershipFragment
      group {
        id
        name
        logo
      }
    }
  }
  ${GROUP_MEMBERSHIP_FRAGMENT}
`;

// Get a specific group membership
export const GET_GROUP_MEMBERSHIP = gql`
  query GetGroupMembership($id: String!) {
    groupMembership(id: $id) {
      ...GroupMembershipFragment
    }
  }
  ${GROUP_MEMBERSHIP_FRAGMENT}
`;

// Add a member to a group
export const ADD_GROUP_MEMBER = gql`
  mutation AddGroupMember($input: AddGroupMemberInput!) {
    addGroupMember(input: $input) {
      ...GroupMembershipFragment
    }
  }
  ${GROUP_MEMBERSHIP_FRAGMENT}
`;

// Change a member's role
export const CHANGE_MEMBER_ROLE = gql`
  mutation ChangeMemberRole($input: ChangeMemberRoleInput!) {
    changeMemberRole(input: $input) {
      ...GroupMembershipFragment
    }
  }
  ${GROUP_MEMBERSHIP_FRAGMENT}
`;

// Remove a member from a group
export const REMOVE_GROUP_MEMBER = gql`
  mutation RemoveGroupMember($input: RemoveGroupMemberInput!) {
    removeGroupMember(input: $input) {
      ...GroupMembershipFragment
    }
  }
  ${GROUP_MEMBERSHIP_FRAGMENT}
`;

// Leave a group
export const LEAVE_GROUP = gql`
  mutation LeaveGroup($input: LeaveGroupInput!) {
    leaveGroup(input: $input) {
      ...GroupMembershipFragment
    }
  }
  ${GROUP_MEMBERSHIP_FRAGMENT}
`;

export const UPDATE_GROUP_MEMBERSHIP_STATUS = gql`
  mutation UpdateGroupMembershipStatus(
    $input: UpdateGroupMembershipStatusInput!
  ) {
    updateGroupMembershipStatus(input: $input) {
      ...GroupMembershipFragment
    }
  }
  ${GROUP_MEMBERSHIP_FRAGMENT}
`;
