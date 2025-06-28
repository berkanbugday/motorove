import { InputType } from '@nestjs/graphql';
import { BaseGroupMembershipInput } from './base-group-membership.input';
import { IAddGroupMember } from '@motorove/shared';

@InputType()
export class AddGroupMemberInput
  extends BaseGroupMembershipInput
  implements IAddGroupMember {}
