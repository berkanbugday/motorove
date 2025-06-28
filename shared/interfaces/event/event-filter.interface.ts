import {
  EventType,
  DifficultyLevel,
  ExperienceLevel,
  RoadType,
} from "../../enums";

/**
 * Event Filter Interface
 */
export interface IEventFilter {
  /**
   * Filter by event type
   */
  eventType?: EventType;

  /**
   * Filter by start date from
   */
  startDateFrom?: Date;

  /**
   * Filter by start date to
   */
  startDateTo?: Date;

  /**
   * Search query string
   */
  query?: string;

  /**
   * Filter by difficulty level
   */
  difficultyLevel?: DifficultyLevel;

  /**
   * Filter by experience level
   */
  experienceLevel?: ExperienceLevel;

  /**
   * Filter by road type
   */
  roadType?: RoadType;

  /**
   * Filter by group ID
   */
  groupId?: string;

  /**
   * Filter by creator ID
   */
  createdById?: string;

  /**
   * Filter by privacy setting
   */
  isPrivate?: boolean;

  /**
   * Filter by active status
   */
  isActive?: boolean;
}
