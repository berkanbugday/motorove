import {
  DifficultyLevel,
  EventStatus,
  EventType,
  RoadType,
  ExperienceLevel,
  EventParticipantStatus,
  Currency,
} from "../../enums";
import { IEventAddress } from "./event-address.interface";
import { IUser } from "../user/user.interface";
import { IGroup } from "../group/group.interface";
import { IEventParticipant } from "./event-participant.interface";
import { IImage } from "../post/image.interface";

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
  startDateTime: Date | string;
  endDateTime?: Date | string | null;
  maxParticipants?: number | null;
  isPrivate: boolean;
  images?: IImage[] | null;
  addresses?: IEventAddress[] | null;
  organizedByGroupId?: string | null;
  organizedByGroup?: IGroup | null;
  roadType?: RoadType | null;
  difficultyLevel?: DifficultyLevel | null;
  routeDescription?: string | null;
  restStops?: string | null;
  campingInfo?: string | null;
  equipmentChecklist?: string | null;
  instructorInfo?: string | null;
  topicsCovered?: string | null;
  experienceLevel?: ExperienceLevel | null;
  price?: number | null;
  currency?: Currency | null;
  distanceKm?: number | null;
  durationSeconds?: number | null;
  participantsCount?: number | null;
  isParticipating?: boolean | null;
  participationStatus?: EventParticipantStatus | null;
  participants?: IEventParticipant[] | null;
  createdBy: IUser;
  createdById: string;
  createdAt: Date | string;
  updatedBy: IUser;
  updatedById: string;
  updatedAt: Date | string;
  isActive: boolean;
}
