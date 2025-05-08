import {gql} from '@apollo/client';

// GroupTag fragment
export const GROUP_TAG_FRAGMENT = gql`
  fragment GroupTagFragment on GroupTag {
    id
    value
  }
`;

// Get all group tags query
export const GET_GROUP_TAGS = gql`
  query GetGroupTags {
    groupTags {
      ...GroupTagFragment
    }
  }
  ${GROUP_TAG_FRAGMENT}
`;

// Get group tag by ID query
export const GET_GROUP_TAG = gql`
  query GetGroupTag($id: ID!) {
    groupTag(id: $id) {
      ...GroupTagFragment
    }
  }
  ${GROUP_TAG_FRAGMENT}
`;
