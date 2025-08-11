import { AddressType, Language } from "../../enums";

/**
 * Address Interface
 * Interface for location addresses
 */
export interface IAddress {
  id: string;
  address: string;
  country?: string | null;
  language: Language;
  type: AddressType;
  latitude: number;
  longitude: number;
}
