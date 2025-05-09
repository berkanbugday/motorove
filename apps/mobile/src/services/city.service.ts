import {useQuery} from '@apollo/client';
import {GET_CITIES, GET_CITY} from './graphql/city.graphql';
import {loggingService} from './logging.service';

// Type definitions
export interface City {
  id: string;
  value: string;
}

// Hook for getting all cities
export const useGetCities = () => {
  const {data, loading, error, refetch} = useQuery(GET_CITIES, {
    onError: errorObj => {
      loggingService.error('Error fetching cities:', errorObj);
    },
  });

  return {
    cities: (data?.cities as City[]) || [],
    loading,
    error,
    refetch,
  };
};

// Hook for getting a specific city
export const useGetCity = (id: string) => {
  const {data, loading, error, refetch} = useQuery(GET_CITY, {
    variables: {id},
    skip: !id,
    onError: errorObj => {
      loggingService.error('Error fetching city:', errorObj);
    },
  });

  return {
    city: data?.city as City | undefined,
    loading,
    error,
    refetch,
  };
};

// Export as CityService object
export const CityService = {
  useGetCities,
  useGetCity,
};

export default CityService;
