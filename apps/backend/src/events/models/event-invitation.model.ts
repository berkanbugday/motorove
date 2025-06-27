import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { InvitationStatus } from '../../enums/models/invitation-status.enum';
import { BaseModel } from '../../core/models/base.model';
import { Event } from './event.model';

@ObjectType()
export class EventInvitation extends BaseModel {
  @Field(() => String)
  eventId: string;

  @Field(() => Event)
  event: Event;

  @Field(() => String)
  inviteeId: string;

  @Field(() => User)
  invitee: User;

  @Field(() => InvitationStatus)
  status: InvitationStatus;
}
