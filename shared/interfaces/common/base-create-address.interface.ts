import { Language } from "../../enums";

/**
 * Base Address Interface
 * Common fields for location-based entities
 */
export interface IBaseCreateAddress {
  latitude: number;
  longitude: number;
  address: string;
  language: Language;
  country?: string;
}
