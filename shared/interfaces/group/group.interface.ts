import { GroupPrivacy } from "../../enums";

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
  city: string;
  privacy: GroupPrivacy;
  tags: string[];
  membersCapacity?: number | null;
  membersCount?: number | null;
  isMember?: boolean;
  isAdmin?: boolean;
  createdAt: Date | string;
}

/**
 * Group with related entities
 */
export interface IGroupWithRelations extends IGroup {
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
