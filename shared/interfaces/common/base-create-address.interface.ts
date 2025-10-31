import { Language } from "../../enums";

/**
 * Base Create Address Interface
 * Common fields for creating location-based entities
 */
export interface IBaseCreateAddress {
  latitude: number;
  longitude: number;
  address: string;
  language: Language;
  countryCode?: string;
}
