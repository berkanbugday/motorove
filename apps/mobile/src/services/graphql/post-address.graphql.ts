import {gql} from '@apollo/client';

export const POST_ADDRESS_FRAGMENT = gql`
  fragment PostAddressFragment on PostAddressDto {
    id
    address
    countryCode
    language
    latitude
    longitude
    postId
  }
`;
