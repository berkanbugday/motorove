import { EmergencyType } from "../../enums";
import { ICreateEmergencyAddress } from "./create-emergency-address.interface";
import { ICreateEmergencyDescription } from "./create-emergency-description.interface";

export interface ICreateEmergency {
  type: EmergencyType;
  descriptions?: ICreateEmergencyDescription[];
  addresses: ICreateEmergencyAddress[];
}
