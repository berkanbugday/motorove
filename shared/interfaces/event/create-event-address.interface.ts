import { AddressType } from "../../enums";
import { IBaseCreateAddress } from "../common/base-create-address.interface";

/**
 * Create Event Address Interface
 */
export interface ICreateEventAddress extends IBaseCreateAddress {
  /**
   * Type of event address (MEETING, START, FINISH)
   */
  type: AddressType;
}
