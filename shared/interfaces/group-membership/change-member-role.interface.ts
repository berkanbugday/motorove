import { GroupMemberRole } from "../../enums";
import { IBaseGroupMembership } from "./base-group-membership.interface";

/**
 * Change Member Role Interface
 * Used for changing a group member's role
 */
export interface IChangeMemberRole extends IBaseGroupMembership {
  /**
   * The new role to assign to the member
   */
  role: GroupMemberRole;
}
