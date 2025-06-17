import { User } from '../../auth/models/user.model';

// This interface describes the shape of the post data returned by Prisma
export interface PrismaPost {
  id: string;
  content: string;
  images?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  group?: any; // Using any for group to avoid circular dependencies
  comments?: any[]; // Using any for comments to avoid circular dependencies
  addresses?: any[]; // Using any for addresses to avoid circular dependencies
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  createdBy: Partial<User>;
  updatedBy?: Partial<User> | null;
}
