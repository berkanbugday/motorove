import {gql} from '@apollo/client';

// Group fragment
export const GROUP_FRAGMENT = gql`
  fragment GroupFragment on Group {
    id
    name
    description
    logo
    cover
    city
    privacy
    membersCapacity
    tags
  }
`;

// Create group mutation
export const CREATE_GROUP = gql`
  mutation CreateGroup($input: CreateGroupInput!) {
    createGroup(createGroupInput: $input) {
      ...GroupFragment
    }
  }
  ${GROUP_FRAGMENT}
`;

// Get group by ID query
export const GET_GROUP = gql`
  query GetGroup($id: ID!) {
    getGroup(id: $id) {
      ...GroupFragment
    }
  }
  ${GROUP_FRAGMENT}
`;

// Get user groups query
export const GET_USER_GROUPS = gql`
  query GetUserGroups {
    getUserGroups {
      ...GroupFragment
    }
  }
  ${GROUP_FRAGMENT}
`;
