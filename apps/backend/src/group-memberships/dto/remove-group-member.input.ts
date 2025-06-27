import { InputType } from '@nestjs/graphql';
import { BaseGroupMembershipInput } from './base-group-membership.input';

@InputType()
export class RemoveGroupMemberInput extends BaseGroupMembershipInput {}
