import { WarningType } from "../../enums/warning-type.enum";
import { IBaseCreateAddress, IBaseCreateDescription } from "../common";

export interface ICreateWarning {
  type: WarningType;
  addresses: IBaseCreateAddress[];
  descriptions?: IBaseCreateDescription[] | null;
}
