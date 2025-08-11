import { IBase } from "../common/base.interface";
import { ApprovalStatus } from "../../enums";
import { IEvent } from "./event.interface";
import { IUser } from "../user/user.interface";

/**
 * Event Invitation Interface
 * Interface for event invitations
 */
export interface IEventInvitation extends IBase {
  eventId: string;
  inviteeId: string;
  status: ApprovalStatus;
  event?: IEvent;
  invitee?: IUser;
}
