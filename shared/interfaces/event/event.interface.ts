import { DifficultyLevel, EventType, RoadType } from "../../enums";

/**
 * Event Interface
 * Base event information
 */
export interface IEvent {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  startDate: Date | string;
  endDate: Date | string;
  thumbnail?: string | null;
  roadType?: RoadType | null;
  difficultyLevel?: DifficultyLevel | null;
  groupId?: string | null;
  createdById: string;
  createdAt: Date | string;
  updatedById: string;
  updatedAt: Date | string;
  isActive: boolean;
}

/**
 * Event with related entities
 */
export interface IEventWithRelations extends IEvent {
  group?: {
    id: string;
    name: string;
    logo?: string | null;
  };
  createdBy?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
  };
  addresses?: Array<{
    id: string;
    title: string;
    description?: string | null;
    type: string;
    latitude: number;
    longitude: number;
  }>;
  participants?: Array<{
    id: string;
    userId: string;
    status: string;
    user?: {
      id: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
      avatar?: string | null;
    };
  }>;
  participantsCount?: number;
}
