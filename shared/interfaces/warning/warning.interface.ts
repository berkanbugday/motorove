import { WarningType, ApprovalStatus } from "../../enums";
import { IWarningAddress } from "./warning-address.interface";
import { IWarningDescription } from "./warning-description.interface";

export interface IWarning {
  id: string;
  type: WarningType;
  status: ApprovalStatus;
  addresses: IWarningAddress[];
  descriptions?: IWarningDescription[] | null;
  createdAt: Date | string;
  createdById: string;
}
