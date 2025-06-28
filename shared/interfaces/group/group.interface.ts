import { GroupPrivacy } from "../enums/group-privacy.enum";

/**
 * Group Interface
 * Base group information
 */
export interface IGroup {
  id: string;
  name: string;
  description: string;
  logo?: string | null;
  cover?: string | null;
  cityId: string;
  privacy: GroupPrivacy;
  membersCapacity?: number | null;
  createdById: string;
  createdAt: Date | string;
  updatedById: string;
  updatedAt: Date | string;
  isActive: boolean;
}

/**
 * Group with related entities
 */
export interface IGroupWithRelations extends IGroup {
  city?: {
    id: string;
    value: string;
  };
  tags?: Array<{
    id: string;
    value: string;
  }>;
  createdBy?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
  };
  isMember?: boolean;
  isAdmin?: boolean;
  membersCount?: number;
}
