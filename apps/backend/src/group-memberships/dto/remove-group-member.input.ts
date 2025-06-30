import { InputType } from '@nestjs/graphql';
import { BaseGroupMembershipInput } from './base-group-membership.input';
import { IRemoveGroupMember } from '@motorove/shared';

@InputType()
export class RemoveGroupMemberInput
  extends BaseGroupMembershipInput
  implements IRemoveGroupMember {}
