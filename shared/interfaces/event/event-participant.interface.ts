import { IBase } from "../common/base.interface";
import { EventParticipantStatus } from "../../enums";
import { IEvent } from "./event.interface";
import { IUser } from "../user/user.interface";

/**
 * Event Participant Interface
 * Interface for event participants
 */
export interface IEventParticipant extends IBase {
  eventId: string;
  userId: string;
  status: EventParticipantStatus;
  event?: IEvent;
  user?: IUser;
}
