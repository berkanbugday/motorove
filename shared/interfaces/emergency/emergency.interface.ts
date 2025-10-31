import { EmergencyType, ApprovalStatus } from "../../enums";
import { IEmergencyAddress } from "./emergency-address.interface";
import { IEmergencyDescription } from "./emergency-description.interface";

export interface IEmergency {
  id: string;
  type: EmergencyType;
  status: ApprovalStatus;
  addresses: IEmergencyAddress[];
  descriptions?: IEmergencyDescription[] | null;
  createdAt: Date | string;
}
