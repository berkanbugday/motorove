import { SupportCategory } from "../../enums";

export interface ICreateSupportRequest {
  category: SupportCategory;
  subject: string;
  message: string;
  deviceInfo: Record<string, any>;
}
