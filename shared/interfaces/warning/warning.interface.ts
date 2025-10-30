import { WarningType, ApprovalStatus } from "../../enums";
import { IBaseAddress, IBaseDescription } from "../common";

export interface IWarning {
  id: string;
  type: WarningType;
  status: ApprovalStatus;
  addresses: IBaseAddress[];
  descriptions?: IBaseDescription[] | null;
}
