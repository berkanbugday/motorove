import { ICity } from "../city/city.interface";
import { InvitationStatus } from "../../enums/invitation-status.enum";

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
  followingStatus?: InvitationStatus;
  city?: ICity;
}
