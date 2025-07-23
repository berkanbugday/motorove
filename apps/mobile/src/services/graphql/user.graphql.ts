import {gql} from '@apollo/client';
import {CITY_FRAGMENT} from './city.graphql';

// User fragment
export const USER_FRAGMENT = gql`
  fragment UserFragment on UserDto {
    id
    firstName
    lastName
    email
    avatar
    supabaseId
    followerCount
    followingCount
    isFollowing
    city {
      ...CityFragment
    }
  }
  ${CITY_FRAGMENT}
`;

// Queries
export const SEARCH_USERS = gql`
  query SearchUsers($input: SearchUsersInput!) {
    searchUsers(searchUsersInput: $input) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const ACCOUNT_SETUP = gql`
  mutation AccountSetup($input: AccountSetupInput!) {
    accountSetup(input: $input)
  }
`;
