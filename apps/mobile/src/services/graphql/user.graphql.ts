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

// Me fragment (includes userSetting)
export const ME_FRAGMENT = gql`
  fragment MeFragment on UserDto {
    id
    firstName
    lastName
    email
    avatar
    hasCompletedSetup
    supabaseId
    userSetting {
      notificationPermission
      preferredLanguage
    }
  }
`;

// Profile fragment
export const PROFILE_FRAGMENT = gql`
  fragment ProfileFragment on ProfileDto {
    id
    firstName
    lastName
    email
    avatar
    bio
    gender
    dateOfBirth
    ridingStyles
    interests
    followingStatus
    socialMediaProfiles {
      id
      platform
      username
    }
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

export const GET_ME = gql`
  query GetMe {
    me {
      ...MeFragment
    }
  }
  ${ME_FRAGMENT}
`;

export const ACCOUNT_SETUP = gql`
  mutation AccountSetup($input: AccountSetupInput!) {
    accountSetup(input: $input)
  }
`;

// Get user profile with extended data
export const GET_USER_PROFILE = gql`
  query GetUserProfile($id: String!) {
    userProfile(id: $id) {
      ...ProfileFragment
    }
  }
  ${PROFILE_FRAGMENT}
`;

// Get user stats (posts, events, followers, following counts)
export const GET_USER_STATS = gql`
  query GetUserStats($userId: String!) {
    userStats(userId: $userId) {
      postsCount
      eventsCount
      followersCount
      followingCount
    }
  }
`;

// Update user profile
export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      ...ProfileFragment
    }
  }
  ${PROFILE_FRAGMENT}
`;
