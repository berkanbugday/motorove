/**
 * Event domain model
 * Based on the backend Event model
 */

import {DifficultyLevel, EventType, ExperienceLevel, RoadType} from '../enums';

/**
 * Basic event information
 */
export interface Event {
  id: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime?: string;
  eventType: EventType;
  difficultyLevel?: DifficultyLevel;
  experienceLevel?: ExperienceLevel;
  roadType?: RoadType;
  maxParticipants?: number;
  price?: number;
  isPrivate: boolean;
  isActive: boolean;
  images?: string[];
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;

  // Fields for specific event types
  routeDescription?: string;
  restStops?: string;
  campingInfo?: string;
  equipmentChecklist?: string;
  instructorInfo?: string;
  topicsCovered?: string;

  // Additional fields for frontend
  isParticipating?: boolean;
  participantsCount?: number;
  participationStatus?: string;
}

/**
 * Event with relations
 */
export interface EventWithRelations extends Event {
  addresses?: any[]; // Will define proper Address type
  createdBy?: any; // Will define proper User type
  updatedBy?: any; // Will define proper User type
  participants?: any[]; // Will define proper EventParticipant type
  invitations?: any[]; // Will define proper EventInvitation type
  invitedGroups?: any[]; // Will define proper Group type
  invitedUsers?: any[]; // Will define proper User type
}
