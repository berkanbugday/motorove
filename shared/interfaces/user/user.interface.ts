import { ICity } from "../city/city.interface";

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
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  city?: ICity;
}
