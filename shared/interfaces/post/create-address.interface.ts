/**
 * Interface for creating address data
 */
export interface ICreateAddress {
  /**
   * Address ID
   */
  id?: string;

  /**
   * Address name
   */
  name: string;

  /**
   * Address details
   */
  address: string;

  /**
   * Address latitude
   */
  latitude: number;

  /**
   * Address longitude
   */
  longitude: number;

  /**
   * Address type
   */
  type: string;
}
