/**
 * Group Membership domain model
 * Based on the backend GroupMembership model
 */

import {GroupMemberRole, InvitationStatus} from '../enums';

/**
 * Basic group membership information
 */
export interface GroupMembership {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  status: InvitationStatus;
  joinedAt: string;
  isActive: boolean;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Group membership with relations
 */
export interface GroupMembershipWithRelations extends GroupMembership {
  group?: any; // Will define proper Group type
  user?: any; // Will define proper User type
  createdBy?: any; // Will define proper User type
  updatedBy?: any; // Will define proper User type
}
