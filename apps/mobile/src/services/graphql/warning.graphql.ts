import {gql} from '@apollo/client';

// Warning Description Fragment
export const WARNING_DESCRIPTION_FRAGMENT = gql`
  fragment WarningDescriptionFragment on WarningDescriptionDto {
    id
    description
    language
  }
`;

// Warning Address Fragment
export const WARNING_ADDRESS_FRAGMENT = gql`
  fragment WarningAddressFragment on WarningAddressDto {
    id
    address
    countryCode
    latitude
    longitude
    language
  }
`;

// Warning Fragment
export const WARNING_FRAGMENT = gql`
  fragment WarningFragment on WarningDto {
    id
    type
    status
    isActive
    createdAt
    updatedAt
    createdById
    descriptions {
      ...WarningDescriptionFragment
    }
    addresses {
      ...WarningAddressFragment
    }
  }
  ${WARNING_DESCRIPTION_FRAGMENT}
  ${WARNING_ADDRESS_FRAGMENT}
`;

export const CREATE_WARNING = gql`
  mutation CreateWarning($input: CreateWarningInput!) {
    createWarning(input: $input) {
      ...WarningFragment
    }
  }
  ${WARNING_FRAGMENT}
`;

// Get all warnings within map viewport bounds (polygon)
export const GET_WARNINGS = gql`
  query GetWarnings($filter: FilterWarningInput!) {
    warnings(filter: $filter) {
      ...WarningFragment
    }
  }
  ${WARNING_FRAGMENT}
`;

// Get warning by ID query
export const GET_WARNING = gql`
  query GetWarning($id: ID!) {
    warning(id: $id) {
      ...WarningFragment
    }
  }
  ${WARNING_FRAGMENT}
`;

// Get current user's warnings
export const GET_MY_WARNINGS = gql`
  query GetMyWarnings {
    myWarnings {
      ...WarningFragment
    }
  }
  ${WARNING_FRAGMENT}
`;

export const REMOVE_WARNING = gql`
  mutation RemoveWarning($id: ID!) {
    removeWarning(id: $id)
  }
`;
