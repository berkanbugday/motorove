import { GroupMemberRole, ApprovalStatus } from "../../enums";
import { IGroup } from "../group/group.interface";
import { IUser } from "../user/user.interface";

/**
 * Group Membership Interface
 * Base group membership information
 */
export interface IGroupMembership {
  id: string;
  group?: IGroup;
  user: IUser;
  role: GroupMemberRole;
  status: ApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
}
