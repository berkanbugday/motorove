/**
 * Comment domain model
 * Based on the backend Comment model
 */

/**
 * Basic comment information
 */
export interface Comment {
  id: string;
  content: string;
  postId: string;
  createdById: string;
  updatedById: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Comment with relations
 */
export interface CommentWithRelations extends Comment {
  post?: any; // Will define proper type when Post model is created
  createdBy?: any; // Will define proper type when User model is created
  updatedBy?: any; // Will define proper type when User model is created
  parent?: Comment;
  replies?: Comment[];
}
