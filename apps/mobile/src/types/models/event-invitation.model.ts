/**
 * Event Invitation domain model
 * Based on the backend EventInvitation model
 */

import {InvitationStatus} from '../enums';

/**
 * Basic event invitation information
 */
export interface EventInvitation {
  id: string;
  eventId: string;
  inviteeId: string;
  status: InvitationStatus;
  isActive: boolean;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Event invitation with relations
 */
export interface EventInvitationWithRelations extends EventInvitation {
  event?: any; // Will define proper Event type
  invitee?: any; // Will define proper User type
  createdBy?: any; // Will define proper User type
  updatedBy?: any; // Will define proper User type
}
