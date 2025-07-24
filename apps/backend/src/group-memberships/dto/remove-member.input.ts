import { InputType } from '@nestjs/graphql';
import { BaseGroupMembershipInput } from './base-group-membership.input';
import { IRemoveMember } from '@motorove/shared';

@InputType()
export class RemoveMemberInput
  extends BaseGroupMembershipInput
  implements IRemoveMember {}
