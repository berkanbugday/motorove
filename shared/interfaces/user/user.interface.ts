import { ICity } from "../city/city.interface";
import { ApprovalStatus } from "../../enums/approval-status.enum";

/**
 * User Interface
 * Base user information
 */
export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  supabaseId: string;
  followingStatus?: ApprovalStatus;
  city?: ICity;
}
