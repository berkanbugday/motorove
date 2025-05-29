import { User } from '../../auth/models/user.model';

// This interface describes the shape of the comment data returned by Prisma
export interface PrismaComment {
  id: string;
  content: string;
  post: any; // Using any for post to avoid circular references
  postId: string;
  parentId: string | null;
  parent?: any; // Using any for parent to avoid circular references
  replies?: any[]; // Using any for replies to avoid circular references
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  createdBy: Partial<User>;
  createdById: string;
  updatedBy?: Partial<User> | null;
  updatedById?: string | null;
}
