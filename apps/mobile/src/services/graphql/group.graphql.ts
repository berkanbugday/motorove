import {gql} from '@apollo/client';

// Group fragment
export const CREATE_GROUP_FRAGMENT = gql`
  fragment CreateGroupFragment on Group {
    id
    name
    description
    logo
    cover
    city {
      id
      value
    }
    privacy
    membersCapacity
    tags {
      id
      value
    }
  }
`;

// Group fragment
export const GROUP_FRAGMENT = gql`
  fragment GroupFragment on Group {
    id
    name
    description
    logo
    cover
    isMember
    isAdmin
    city {
      id
      value
    }
    privacy
    membersCapacity
    tags {
      id
      value
    }
    memberships {
      id
      role
      user {
        id
        firstName
        lastName
        avatar
      }
    }
  }
`;

// Create group mutation
export const CREATE_GROUP = gql`
  mutation CreateGroup($input: CreateGroupInput!) {
    createGroup(createGroupInput: $input) {
      ...CreateGroupFragment
    }
  }
  ${CREATE_GROUP_FRAGMENT}
`;

export const GET_GROUPS = gql`
  query GetGroups {
    groups {
      ...GroupFragment
    }
  }
  ${GROUP_FRAGMENT}
`;

// Get group by ID query
export const GET_GROUP = gql`
  query GetGroup($id: String!) {
    group(id: $id) {
      ...GroupFragment
    }
  }
  ${GROUP_FRAGMENT}
`;

// Get user groups query
export const GET_JOINED_GROUPS = gql`
  query GetJoinedGroups {
    joinedGroups {
      ...GroupFragment
    }
  }
  ${GROUP_FRAGMENT}
`;
