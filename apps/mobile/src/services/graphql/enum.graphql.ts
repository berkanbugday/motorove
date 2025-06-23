import {gql} from '@apollo/client';

export const GET_GROUP_PRIVACY_OPTIONS = gql`
  query GetGroupPrivacyOptions {
    getGroupPrivacyOptions {
      key
      value
    }
  }
`;

export const GET_GROUP_MEMBER_ROLES = gql`
  query GetGroupMemberRoles {
    getGroupMemberRoles {
      key
      value
    }
  }
`;

export const GET_EVENT_TYPES = gql`
  query GetEventTypes {
    getEventTypes {
      key
      value
    }
  }
`;

export const GET_ROAD_TYPES = gql`
  query GetRoadTypes {
    getRoadTypes {
      key
      value
    }
  }
`;

export const GET_DIFFICULTY_LEVELS = gql`
  query GetDifficultyLevels {
    getDifficultyLevels {
      key
      value
    }
  }
`;

export const GET_EXPERIENCE_LEVELS = gql`
  query GetExperienceLevels {
    getExperienceLevels {
      key
      value
    }
  }
`;
