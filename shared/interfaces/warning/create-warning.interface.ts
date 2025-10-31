import { WarningType } from "../../enums/warning-type.enum";
import { ICreateWarningAddress } from "./create-warning-address.interface";
import { ICreateWarningDescription } from "./create-warning-description.interface";

export interface ICreateWarning {
  type: WarningType;
  addresses: ICreateWarningAddress[];
  descriptions?: ICreateWarningDescription[] | null;
}
