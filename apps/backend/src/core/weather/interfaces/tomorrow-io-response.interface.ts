/**
 * Interface for the Tomorrow.io API response
 */
export interface TomorrowIoResponse {
  data: {
    values: {
      temperature: number;
      weatherCode: number;
    };
  };
}
