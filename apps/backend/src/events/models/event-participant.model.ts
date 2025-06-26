import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { Event } from './event.model';
import { EventParticipantStatus } from '../../enums/models/event-participant-status.enum';

@ObjectType()
export class EventParticipant {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  eventId: string;

  @Field(() => Event)
  event: Event;

  @Field(() => String)
  userId: string;

  @Field(() => User)
  user: User;

  @Field(() => EventParticipantStatus)
  status: EventParticipantStatus;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
