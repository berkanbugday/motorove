import { EmergencyType, ApprovalStatus } from "../../enums";
import { IEmergencyAddress } from "./emergency-address.interface";
import { IEmergencyDescription } from "./emergency-description.interface";
import { IBase } from "../common/base.interface";

export interface IEmergency extends IBase {
  type: EmergencyType;
  status: ApprovalStatus;
  addresses: IEmergencyAddress[];
  descriptions?: IEmergencyDescription[] | null;
}
