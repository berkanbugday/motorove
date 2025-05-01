/**
 * User domain model
 */

/**
 * Basic user profile information
 */
export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Extended user information
 */
export interface UserDetails extends UserProfile {
  phoneNumber?: string;
  location?: {
    country?: string;
    city?: string;
    address?: string;
  };
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
  };
}

/**
 * User with related entities
 */
export interface UserWithRelations extends UserProfile {
  posts?: Array<{
    id: string;
    title: string;
    createdAt: string;
  }>;
  followers?: number;
  following?: number;
}
