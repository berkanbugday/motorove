import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Event } from './event.model';
import { EventParticipantStatus } from '../../enums/models/event-participant-status.enum';
import { BaseModel } from 'src/core/models/base.model';

@ObjectType()
export class EventParticipant extends BaseModel {
  @Field(() => String)
  eventId: string;

  @Field(() => Event)
  event: Event;

  @Field(() => EventParticipantStatus)
  status: EventParticipantStatus;
}
