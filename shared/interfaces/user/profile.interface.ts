import { ICity } from "../city/city.interface";
import { RidingStyle } from "../../enums/riding-style.enum";
import { Interest } from "../../enums/interest.enum";
import { Gender, ApprovalStatus } from "../../enums";
import { IUserSocialMediaProfile } from "./user-social-media-profile.interface";

/**
 * Profile Interface
 * Extended user profile information with stats
 */
export interface IProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  city?: ICity;
  bio?: string;
  gender?: Gender;
  dateOfBirth?: Date | string;
  ridingStyles?: RidingStyle[];
  interests?: Interest[];
  socialMediaProfiles?: IUserSocialMediaProfile[];
  followingStatus?: ApprovalStatus;
}
