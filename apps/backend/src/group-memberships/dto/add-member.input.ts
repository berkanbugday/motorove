import { InputType } from '@nestjs/graphql';
import { BaseGroupMembershipInput } from './base-group-membership.input';
import { IAddMember } from '@motorove/shared';

@InputType()
export class AddMemberInput
  extends BaseGroupMembershipInput
  implements IAddMember {}
