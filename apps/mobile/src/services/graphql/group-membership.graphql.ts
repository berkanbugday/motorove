import {gql} from '@apollo/client';

// GroupMembership fragment
export const GROUP_MEMBERSHIP_FRAGMENT = gql`
  fragment GroupMembershipFragment on GroupMembership {
    id
    groupId
    userId
    role
    joinedAt
    user {
      id
      name
      email
      phone
      avatar
    }
  }
`;

export const ADD_GROUP_MEMBER_FRAGMENT = gql`
  fragment AddGroupMemberFragment on GroupMembership {
    groupId
    userId
  }
`;

export const REMOVE_GROUP_MEMBER_FRAGMENT = gql`
  fragment RemoveGroupMemberFragment on GroupMembership {
    ...AddGroupMemberFragment
  }
  ${ADD_GROUP_MEMBER_FRAGMENT}
`;

export const CHANGE_MEMBER_ROLE_FRAGMENT = gql`
  fragment ChangeMemberRoleFragment on GroupMembership {
    groupId
    userId
    role
  }
`;

// GroupMembershipStatus fragment
export const GROUP_MEMBERSHIP_STATUS_FRAGMENT = gql`
  fragment GroupMembershipStatusFragment on GroupMembership {
    id
    status
  }
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
    addGroupMember(addGroupMemberInput: $input) {
      ...AddGroupMemberFragment
    }
  }
  ${ADD_GROUP_MEMBER_FRAGMENT}
`;

// Change a member's role
export const CHANGE_MEMBER_ROLE = gql`
  mutation ChangeMemberRole($input: ChangeMemberRoleInput!) {
    changeMemberRole(changeMemberRoleInput: $input) {
      ...ChangeMemberRoleFragment
    }
  }
  ${CHANGE_MEMBER_ROLE_FRAGMENT}
`;

// Remove a member from a group
export const REMOVE_GROUP_MEMBER = gql`
  mutation RemoveGroupMember($input: RemoveGroupMemberInput!) {
    removeGroupMember(removeGroupMemberInput: $input) {
      ...RemoveGroupMemberFragment
    }
  }
  ${REMOVE_GROUP_MEMBER_FRAGMENT}
`;

export const UPDATE_GROUP_MEMBERSHIP_STATUS = gql`
  mutation UpdateGroupMembershipStatus(
    $input: UpdateGroupMembershipStatusInput!
  ) {
    updateGroupMembershipStatus(input: $input) {
      ...GroupMembershipStatusFragment
    }
  }
  ${GROUP_MEMBERSHIP_STATUS_FRAGMENT}
`;
