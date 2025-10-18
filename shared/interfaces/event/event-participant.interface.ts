import { IBase } from "../common/base.interface";
import { EventParticipantStatus } from "../../enums";
import { IUser } from "../user/user.interface";

/**
 * Event Participant Interface
 * Interface for event participants
 */
export interface IEventParticipant extends IBase {
  status: EventParticipantStatus;
  createdBy: IUser;
}
