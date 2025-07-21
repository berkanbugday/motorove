import {gql} from '@apollo/client';

export const CREATE_ADDRESS_FRAGMENT = gql`
  fragment CreateAddressFragment on AddressDto {
    address
    language
    type
    latitude
    longitude
  }
`;

export const UPDATE_ADDRESS_FRAGMENT = gql`
  fragment UpdateAddressFragment on AddressDto {
    ...CreateAddressFragment
  }
  ${CREATE_ADDRESS_FRAGMENT}
`;

export const ADDRESS_FRAGMENT = gql`
  fragment AddressFragment on AddressDto {
    id
    ...CreateAddressFragment
  }
  ${CREATE_ADDRESS_FRAGMENT}
`;
