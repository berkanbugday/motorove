import { DifficultyLevel, EventStatus, EventType, RoadType } from "../../enums";

/**
 * Event Interface
 * Base event information
 */
export interface IEvent {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  status: EventStatus;
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
