import {gql} from '@apollo/client';

// Emergency Description Fragment
export const EMERGENCY_DESCRIPTION_FRAGMENT = gql`
  fragment EmergencyDescriptionFragment on EmergencyDescriptionDto {
    id
    description
    language
  }
`;

// Emergency Address Fragment
export const EMERGENCY_ADDRESS_FRAGMENT = gql`
  fragment EmergencyAddressFragment on EmergencyAddressDto {
    id
    address
    countryCode
    latitude
    longitude
    language
  }
`;

// Emergency Fragment
export const EMERGENCY_FRAGMENT = gql`
  fragment EmergencyFragment on EmergencyDto {
    id
    type
    status
    isActive
    createdAt
    updatedAt
    createdById
    descriptions {
      ...EmergencyDescriptionFragment
    }
    addresses {
      ...EmergencyAddressFragment
    }
  }
  ${EMERGENCY_DESCRIPTION_FRAGMENT}
  ${EMERGENCY_ADDRESS_FRAGMENT}
`;

export const CREATE_EMERGENCY = gql`
  mutation CreateEmergency($input: CreateEmergencyInput!) {
    createEmergency(input: $input) {
      ...EmergencyFragment
    }
  }
  ${EMERGENCY_FRAGMENT}
`;

// Get all emergencies within map viewport bounds (polygon)
export const GET_EMERGENCIES = gql`
  query GetEmergencies($filter: FilterEmergencyInput!) {
    emergencies(filter: $filter) {
      ...EmergencyFragment
    }
  }
  ${EMERGENCY_FRAGMENT}
`;

// Get emergency by ID query
export const GET_EMERGENCY = gql`
  query GetEmergency($id: ID!) {
    emergency(id: $id) {
      ...EmergencyFragment
    }
  }
  ${EMERGENCY_FRAGMENT}
`;

// Get current user's emergencies
export const GET_MY_EMERGENCIES = gql`
  query GetMyEmergencies {
    myEmergencies {
      ...EmergencyFragment
    }
  }
  ${EMERGENCY_FRAGMENT}
`;

export const REMOVE_EMERGENCY = gql`
  mutation RemoveEmergency($id: ID!) {
    removeEmergency(id: $id)
  }
`;
