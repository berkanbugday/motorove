import { User } from '../../auth/models/user.model';

// This interface describes the shape of the post data returned by Prisma
export interface PrismaPost {
  id: string;
  content: string;
  images?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  group?: any; // Using any for group to avoid circular dependencies
  groupId?: string | null;
  comments?: any[]; // Using any for comments to avoid circular dependencies
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  createdBy: Partial<User>;
  createdById: string;
  updatedBy?: Partial<User> | null;
  updatedById?: string | null;
}
