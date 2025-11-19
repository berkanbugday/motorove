import {gql} from '@apollo/client';

export const UPDATE_USER_LOCATION = gql`
  mutation UpdateUserLocation($input: UpdateUserLocationInput!) {
    updateUserLocation(input: $input) {
      id
      userId
      latitude
      longitude
      updatedAt
    }
  }
`;
