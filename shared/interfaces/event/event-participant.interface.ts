import { IBase, IBaseWithRelations } from "../common/base.interface";
import { EventParticipantStatus } from "../../enums";

/**
 * Event Participant Interface
 * Interface for event participants
 */
export interface IEventParticipant extends IBase {
  eventId: string;
  userId: string;
  status: EventParticipantStatus;
}

/**
 * Event Participant with relations
 */
export interface IEventParticipantWithRelations
  extends IBaseWithRelations,
    IEventParticipant {
  event?: {
    id: string;
    title: string;
    startDate: Date | string;
    endDate: Date | string;
    thumbnail?: string | null;
  };

  user?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
  };
}
