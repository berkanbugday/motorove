import {
  EventType,
  RoadType,
  DifficultyLevel,
  ExperienceLevel,
  EventStatus,
  Currency,
} from "../../enums";
import { ICreateAddress } from "../address/create-address.interface";

/**
 * Create Event Interface
 */
export interface ICreateEvent {
  /**
   * Title of the event
   */
  title: string;

  /**
   * Description of the event
   */
  description: string;

  /**
   * Type of event
   */
  eventType: EventType;

  /**
   * Status of the event
   */
  status: EventStatus;

  /**
   * Start date and time of the event
   */
  startDateTime: string;

  /**
   * Optional end date and time of the event
   */
  endDateTime?: string;

  /**
   * Optional maximum number of participants
   */
  maxParticipants?: number;

  /**
   * Whether the event is private
   */
  isPrivate?: boolean;

  /**
   * Optional array of image URLs
   */
  images: string[];

  /**
   * Optional addresses related to the event
   */
  addresses?: ICreateAddress[];

  /**
   * Optional array of invited group IDs
   */
  invitedGroupIds?: string[];

  /**
   * Optional array of invited user IDs
   */
  invitedUserIds?: string[];

  /**
   * Optional ID of the user organizing the event
   */
  organizedByUserId?: string;

  /**
   * Optional ID of the group organizing the event
   */
  organizedByGroupId?: string;

  /**
   * Optional road type (for ride events)
   */
  roadType?: RoadType;

  /**
   * Optional difficulty level (for ride events)
   */
  difficultyLevel?: DifficultyLevel;

  /**
   * Optional route description (for ride events)
   */
  routeDescription?: string;

  /**
   * Optional rest stops information (for ride events)
   */
  restStops?: string;

  /**
   * Optional camping information (for camping ride events)
   */
  campingInfo?: string;

  /**
   * Optional equipment checklist (for ride events)
   */
  equipmentChecklist?: string;

  /**
   * Optional instructor information (for training events)
   */
  instructorInfo?: string;

  /**
   * Optional topics covered (for training events)
   */
  topicsCovered?: string;

  /**
   * Optional experience level (for ride events)
   */
  experienceLevel?: ExperienceLevel;

  /**
   * Optional price information (for training events)
   */
  price?: string;

  /**
   * Optional currency (for training events)
   */
  currency?: Currency;
}
