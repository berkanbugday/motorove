import { InvitationStatus } from "../../enums";

/**
 * Update Membership Status Interface
 * Used for updating a group membership status
 */
export interface IUpdateInvitationStatus {
  /**
   * The new status to set for the membership
   */
  id: string;

  /**
   * The new status to set for the membership
   */
  status: InvitationStatus;
}
