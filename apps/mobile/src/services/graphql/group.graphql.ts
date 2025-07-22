import {gql} from '@apollo/client';
import {CITY_FRAGMENT} from './city.graphql';

// Group fragment
export const GROUP_FRAGMENT = gql`
  fragment GroupFragment on GroupDto {
    id
    name
    description
    logo
    cover
    isMember
    isAdmin
    city {
      ...CityFragment
    }
    privacy
    membersCapacity
    membersCount
    tags
    createdAt
    memberships {
      id
      role
      user {
        id
        firstName
        lastName
      }
    }
  }
  ${CITY_FRAGMENT}
`;

// Create group mutation
export const CREATE_GROUP = gql`
  mutation CreateGroup($input: CreateGroupInput!) {
    createGroup(input: $input) {
      ...GroupFragment
    }
  }
  ${GROUP_FRAGMENT}
`;

// Update group mutation
export const UPDATE_GROUP = gql`
  mutation UpdateGroup($input: UpdateGroupInput!) {
    updateGroup(input: $input) {
      ...GroupFragment
    }
  }
  ${GROUP_FRAGMENT}
`;

export const GET_GROUPS = gql`
  query GetGroups($limit: Int, $skip: Int, $filters: FilterGroupInput) {
    groups(limit: $limit, skip: $skip, filters: $filters) {
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
  query GetJoinedGroups($limit: Int, $skip: Int, $filters: FilterGroupInput) {
    joinedGroups(limit: $limit, skip: $skip, filters: $filters) {
      ...GroupFragment
    }
  }
  ${GROUP_FRAGMENT}
`;

// Search groups by name
export const SEARCH_GROUPS = gql`
  query SearchGroups($query: String!, $limit: Int, $skip: Int) {
    groups(limit: $limit, skip: $skip, query: $query) {
      ...GroupFragment
    }
  }
  ${GROUP_FRAGMENT}
`;
