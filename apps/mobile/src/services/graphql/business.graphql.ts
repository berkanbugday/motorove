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
    mainCategory
    subCategories
    areaCode
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
  }
  ${ADDRESS_FRAGMENT}
  ${BUSINESS_DESCRIPTION_FRAGMENT}
  ${WORKING_HOUR_FRAGMENT}
`;

// Get all businesses query
export const GET_BUSINESSES = gql`
  query GetBusinesses($limit: Int, $skip: Int) {
    businesses(limit: $limit, skip: $skip) {
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
  query SearchBusinesses($query: String!, $limit: Int, $skip: Int) {
    businesses(query: $query, limit: $limit, skip: $skip) {
      ...BusinessFragment
    }
  }
  ${BUSINESS_FRAGMENT}
`;
