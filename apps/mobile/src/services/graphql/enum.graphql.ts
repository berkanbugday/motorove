import {gql} from '@apollo/client';

export const GET_CITIES = gql`
  query GetCities {
    getCities {
      key
      value
    }
  }
`;

export const GET_GROUP_PRIVACY_OPTIONS = gql`
  query GetGroupPrivacyOptions {
    getGroupPrivacyOptions {
      key
      value
    }
  }
`;

export const GET_GROUP_TAGS = gql`
  query GetGroupTags {
    getGroupTags {
      key
      value
    }
  }
`;
