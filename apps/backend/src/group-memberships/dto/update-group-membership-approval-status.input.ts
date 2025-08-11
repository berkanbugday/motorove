import { InputType, Field, ID } from '@nestjs/graphql';
import { IUpdateGroupMembershipApprovalStatus } from '@motorove/shared';
import { ApprovalStatus } from '../../enums/models/approval-status.enum';
import { IsEnum, IsUUID } from 'class-validator';

@InputType()
export class UpdateGroupMembershipApprovalStatusInput
  implements IUpdateGroupMembershipApprovalStatus
{
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => ApprovalStatus)
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;
}
