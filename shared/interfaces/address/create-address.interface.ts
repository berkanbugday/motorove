import { AddressType, Language } from "../../enums";

/**
 * Create Address Interface
 */
export interface ICreateAddress {
  /**
   * Address string
   */
  address: string;

  /**
   * Language of the address
   */
  language: Language;

  /**
   * Type of address
   */
  type: AddressType;

  /**
   * Latitude coordinate
   */
  latitude: number;

  /**
   * Longitude coordinate
   */
  longitude: number;

  /**
   * Optional post ID
   */
  postId?: string;

  /**
   * Optional event ID
   */
  eventId?: string;
}
