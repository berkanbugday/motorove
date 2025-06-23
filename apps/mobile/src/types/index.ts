/**
 * Export all types and interfaces
 */

// Auth types
export * from './auth.types';

// Navigation types
export * from './navigation.types';

// Domain models
export * from './models';

// User type
export type User = {
  id: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
  location?: string;
  bio?: string;
  interests?: string[];
  isFollowing?: boolean;
};
