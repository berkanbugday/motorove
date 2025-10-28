import {gql} from '@apollo/client';
import {ADDRESS_FRAGMENT} from './address.graphql';

// Business Description Fragment
export const BUSINESS_DESCRIPTION_FRAGMENT = gql`
  fragment BusinessDescriptionFragment on BusinessDescriptionDto {
    id
    description
    language
  }
`;

// Working Hour Fragment
export const WORKING_HOUR_FRAGMENT = gql`
  fragment WorkingHourFragment on WorkingHourDto {
    id
    dayOfWeek
    startHour
    endHour
    isOpen24h
  }
`;

// Business Fragment
export const BUSINESS_FRAGMENT = gql`
  fragment BusinessFragment on BusinessDto {
    id
    name
    category
    countryCode
    phoneNumber
    address {
      ...AddressFragment
    }
    descriptions {
      ...BusinessDescriptionFragment
    }
    workingHours {
      ...WorkingHourFragment
    }
    averageRating
    commentsCount
  }
  ${ADDRESS_FRAGMENT}
  ${BUSINESS_DESCRIPTION_FRAGMENT}
  ${WORKING_HOUR_FRAGMENT}
`;

// Get all businesses query with map viewport bounds (polygon)
export const GET_BUSINESSES = gql`
  query GetBusinesses($filter: FilterBusinessInput!) {
    businesses(filter: $filter) {
      ...BusinessFragment
    }
  }
  ${BUSINESS_FRAGMENT}
`;

// Get business by ID query
export const GET_BUSINESS = gql`
  query GetBusiness($id: ID!) {
    business(id: $id) {
      ...BusinessFragment
    }
  }
  ${BUSINESS_FRAGMENT}
`;

// Search businesses by name
export const SEARCH_BUSINESSES = gql`
  query SearchBusinesses($query: String!) {
    businesses(query: $query) {
      ...BusinessFragment
    }
  }
  ${BUSINESS_FRAGMENT}
`;
