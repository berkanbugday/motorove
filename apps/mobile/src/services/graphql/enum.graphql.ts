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
