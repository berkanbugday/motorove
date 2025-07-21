import {gql} from '@apollo/client';

export const ADDRESS_FRAGMENT = gql`
  fragment AddressFragment on AddressDto {
    id
    address
    language
    type
    latitude
    longitude
  }
`;
