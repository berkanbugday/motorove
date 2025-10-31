import { AddressType } from "../../enums";
import { IBaseAddress } from "../common/base-address.interface";

/**
 * Event Address Interface
 * Interface for event location addresses
 */
export interface IEventAddress extends IBaseAddress {
  type: AddressType;
}
