import { InputType, Field, ID } from '@nestjs/graphql';
import { IUpdateGroupMembershipInvitationStatus } from '@motorove/shared';
import { InvitationStatus } from '../../enums/models/invitation-status.enum';
import { IsEnum, IsUUID } from 'class-validator';

@InputType()
export class UpdateGroupMembershipInvitationStatusInput
  implements IUpdateGroupMembershipInvitationStatus
{
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => InvitationStatus)
  @IsEnum(InvitationStatus)
  status: InvitationStatus;
}
