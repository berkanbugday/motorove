/**
 * Base Address Interface
 * Common fields for location-based entities
 */
export interface IBaseAddress {
  latitude: number;
  longitude: number;
  address?: string;
}
