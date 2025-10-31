import {gql} from '@apollo/client';

export const BUSINESS_ADDRESS_FRAGMENT = gql`
  fragment BusinessAddressFragment on BusinessAddressDto {
    id
    address
    countryCode
    language
    latitude
    longitude
    businessId
  }
`;
