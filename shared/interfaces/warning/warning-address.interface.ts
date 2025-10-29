import { IBaseAddress } from '../common/base-address.interface';

/**
 * Warning Address Interface
 * Address-related fields for warning entities
 */
export interface IWarningAddress extends IBaseAddress {
  // Inherits latitude, longitude, address from IBaseAddress
  // Can add warning-specific address fields here if needed in the future
}
