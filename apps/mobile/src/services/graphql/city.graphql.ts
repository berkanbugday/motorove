import {gql} from '@apollo/client';

// City fragment
export const CITY_FRAGMENT = gql`
  fragment CityFragment on CityDto {
    id
    value
  }
`;

// Get all group tags query
export const GET_CITIES = gql`
  query GetCities {
    cities {
      ...CityFragment
    }
  }
  ${CITY_FRAGMENT}
`;

// Get city by ID query
export const GET_CITY = gql`
  query GetCity($id: ID!) {
    city(id: $id) {
      ...CityFragment
    }
  }
  ${CITY_FRAGMENT}
`;
