import { InputType, Field, ID } from '@nestjs/graphql';
import { IUpdateInvitationStatus } from '@motorove/shared';
import { InvitationStatus } from '../../enums/models/invitation-status.enum';
import { IsEnum, IsUUID } from 'class-validator';

@InputType()
export class UpdateInvitationStatusInput implements IUpdateInvitationStatus {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => InvitationStatus)
  @IsEnum(InvitationStatus)
  status: InvitationStatus;
}
