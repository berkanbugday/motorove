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
    followingStatus
    city {
      ...CityFragment
    }
  }
  ${CITY_FRAGMENT}
`;

// Queries
export const SEARCH_USERS = gql`
  query SearchUsers($query: String, $limit: Int!, $skip: Int!) {
    users(query: $query, limit: $limit, skip: $skip) {
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
