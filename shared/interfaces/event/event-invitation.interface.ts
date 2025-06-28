import { IBase, IBaseWithRelations } from "../common/base.interface";
import { InvitationStatus } from "../../enums";

/**
 * Event Invitation Interface
 * Interface for event invitations
 */
export interface IEventInvitation extends IBase {
  eventId: string;
  inviteeId: string;
  status: InvitationStatus;
}

/**
 * Event Invitation with relations
 */
export interface IEventInvitationWithRelations
  extends IBaseWithRelations,
    IEventInvitation {
  event?: {
    id: string;
    title: string;
    startDate: Date | string;
    endDate: Date | string;
    thumbnail?: string | null;
  };

  invitee?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
  };
}
