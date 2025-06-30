import { GroupMemberRole } from "../../enums";
import { IGroup } from "../group/group.interface";
import { IUser } from "../user/user.interface";

/**
 * Group Membership Interface
 * Base group membership information
 */
export interface IGroupMembership {
  id: string;
  group: Partial<IGroup>;
  user: Partial<IUser>;
  role: GroupMemberRole;
  joinedAt: Date | string;
}
