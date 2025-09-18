import {gql} from '@apollo/client';

export const GET_WEATHER = gql`
  query GetWeather {
    weather {
      temperature
      condition
      cityId
      cityName
    }
  }
`;
