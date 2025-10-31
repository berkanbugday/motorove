import { Language } from "../../enums";

/**
 * Base Address Interface
 * Common fields for location-based entities
 */
export interface IBaseAddress {
  id: string;
  address: string;
  countryCode?: string | null;
  language: Language;
  latitude: number;
  longitude: number;
}
