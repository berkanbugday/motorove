export interface IPostInteraction {
  /**
   * Interaction ID
   */
  id: string;

  /**
   * Post ID
   */
  postId: string;

  /**
   * User ID
   */
  userId: string;

  /**
   * Creation timestamp
   */
  createdAt: Date;
}
