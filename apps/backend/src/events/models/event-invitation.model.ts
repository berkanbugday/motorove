import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { InvitationStatus } from '../../enums/models/invitation-status.enum';
import { BaseModel } from '../../core/models/base.model';

@ObjectType()
export class EventInvitation extends BaseModel {
  @Field(() => String)
  eventId: string;

  @Field(() => String)
  inviteeId: string;

  @Field(() => User)
  invitee: User;

  @Field(() => InvitationStatus)
  status: InvitationStatus;
}
