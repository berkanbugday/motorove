import {gql} from '@apollo/client';

export const EVENT_ADDRESS_FRAGMENT = gql`
  fragment EventAddressFragment on EventAddressDto {
    id
    address
    countryCode
    language
    type
    latitude
    longitude
    eventId
  }
`;
