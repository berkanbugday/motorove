import { GroupMemberRole, InvitationStatus } from "../../enums";

/**
 * Group Membership Interface
 * Base group membership information
 */
export interface IGroupMembership {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  status: InvitationStatus;
  joinedAt: Date | string;
  createdById: string;
  createdAt: Date | string;
  updatedById: string;
  updatedAt: Date | string;
  isActive: boolean;
}

/**
 * Group Membership with related entities
 */
export interface IGroupMembershipWithRelations extends IGroupMembership {
  group?: {
    id: string;
    name: string;
    logo?: string | null;
  };
  user?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
  };
}
