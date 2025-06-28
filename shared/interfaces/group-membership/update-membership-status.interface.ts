import { InvitationStatus } from "../../enums";
import { IBaseGroupMembership } from "./base-group-membership.interface";

/**
 * Update Membership Status Interface
 * Used for updating a group membership status
 */
export interface IUpdateMembershipStatus extends IBaseGroupMembership {
  /**
   * The new status to set for the membership
   */
  status: InvitationStatus;
}
