import { GroupPrivacy } from "../../enums";
import { ICity } from "../city/city.interface";
import { GroupTag } from "../../enums";
import { IGroupMembership } from "../group-membership/group-membership.interface";

/**
 * Group Interface
 * Base group information
 */
export interface IGroup {
  id: string;
  name: string;
  description: string;
  logo?: string | null;
  cover?: string | null;
  city: ICity;
  privacy: GroupPrivacy;
  tags: GroupTag[];
  membersCapacity?: number | null;
  membersCount?: number | null;
  isMember?: boolean;
  isAdmin?: boolean;
  isPendingMember?: boolean;
  isOwner?: boolean;
  createdAt: Date | string;
  memberships: IGroupMembership[];
}
