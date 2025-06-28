/**
 * User Following domain model
 * Based on the backend UserFollowing model
 */

/**
 * Basic user following information
 */
export interface UserFollowing {
  id: string;
  createdAt: string;
}

/**
 * User following with relations
 */
export interface UserFollowingWithRelations extends UserFollowing {
  follower?: any; // Will define proper User type
  following?: any; // Will define proper User type
}
