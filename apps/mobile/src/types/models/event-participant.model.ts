/**
 * Event Participant domain model
 * Based on the backend EventParticipant model
 */

import {EventParticipantStatus} from '../enums';

/**
 * Basic event participant information
 */
export interface EventParticipant {
  id: string;
  eventId: string;
  status: EventParticipantStatus;
  isActive: boolean;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Event participant with relations
 */
export interface EventParticipantWithRelations extends EventParticipant {
  event?: any; // Will define proper Event type
  createdBy?: any; // Will define proper User type
  updatedBy?: any; // Will define proper User type
}
