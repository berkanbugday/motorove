import {gql} from '@apollo/client';

export const CREATE_SUPPORT_REQUEST = gql`
  mutation CreateSupportRequest($input: CreateSupportRequestInput!) {
    createSupportRequest(input: $input)
  }
`;
