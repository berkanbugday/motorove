/**
 * User Interface
 * Base user information
 */
export interface IUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  supabaseId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  isActive: boolean;
}

/**
 * Basic user profile information
 */
export interface IUserProfile
  extends Pick<IUser, "id" | "email" | "firstName" | "lastName" | "avatar"> {
  displayName?: string;
  bio?: string;
}

/**
 * Extended user information
 */
export interface IUserDetails extends IUserProfile {
  phoneNumber?: string;
  location?: {
    country?: string;
    city?: string;
    address?: string;
  };
  preferences?: {
    notifications: boolean;
    theme: "light" | "dark" | "system";
  };
}
