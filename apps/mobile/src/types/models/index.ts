/**
 * Export all domain models
 */

// Export user models
export * from './user.model';
export * from './user-following.model';

// Export post and related models
export type {
  Post,
  PostWithRelations,
  PostAddress,
  PostAddressInput,
  PostContentType,
  CreatePostInput,
  UpdatePostInput,
  MediaPost,
  PollPost,
  PostWithUser,
} from './post.model';

// Export post interaction models
export * from './post-interaction.model';

// Export comment model from comment file (avoiding conflict with post.model)
export * from './comment.model';

// Export group related models
export * from './group.model';
export * from './group-tag.model';
export * from './group-membership.model';

// Export event related models
export * from './event.model';
export * from './event-invitation.model';
export * from './event-participant.model';

// Export other models
export * from './address.model';
export * from './city.model';
export * from './notification.model';
