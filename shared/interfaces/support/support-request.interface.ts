import { SupportCategory } from "../../enums";
import { IBase } from "../common/base.interface";

export interface SupportRequest extends IBase {
  category: SupportCategory;
  subject: string;
  message: string;
  deviceInfo: Record<string, any>;
}
