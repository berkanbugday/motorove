import { GroupMemberRole, InvitationStatus } from "../../enums";
import { IUser } from "../user/user.interface";

/**
 * Group Membership Interface
 * Base group membership information
 */
export interface IGroupMembership {
  id: string;
  groupId: string;
  user: IUser;
  role: GroupMemberRole;
  status: InvitationStatus;
  joinedAt: Date;
}
