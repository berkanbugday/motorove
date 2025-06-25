import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import { Group } from '../../groups/models/group.model';
import { EventParticipant } from './event-participant.model';
import { EventInvitation } from './event-invitation.model';
import { BaseModel } from '../../core/models/base.model';

@ObjectType()
export class Event extends BaseModel {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  eventType: string;

  @Field(() => Date)
  startDateTime: Date;

  @Field(() => Date, { nullable: true })
  endDateTime?: Date;

  @Field(() => String, { nullable: true })
  meetingPoint?: string;

  @Field(() => String, { nullable: true })
  startLocation?: string;

  @Field(() => String, { nullable: true })
  finishLocation?: string;

  @Field(() => Int, { nullable: true })
  maxParticipants?: number;

  @Field(() => Boolean)
  isPrivate: boolean;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field(() => String, { nullable: true })
  groupId?: string;

  @Field(() => Group, { nullable: true })
  group?: Group;

  // Ride-specific fields
  @Field(() => String, { nullable: true })
  roadType?: string;

  @Field(() => String, { nullable: true })
  difficultyLevel?: string;

  @Field(() => String, { nullable: true })
  routeDescription?: string;

  @Field(() => String, { nullable: true })
  restStops?: string;

  @Field(() => String, { nullable: true })
  campingInfo?: string;

  @Field(() => String, { nullable: true })
  equipmentChecklist?: string;

  // Workshop-specific fields
  @Field(() => String, { nullable: true })
  instructorInfo?: string;

  @Field(() => String, { nullable: true })
  topicsCovered?: string;

  @Field(() => String, { nullable: true })
  experienceLevel?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  // Coordinates for locations
  @Field(() => Float, { nullable: true })
  meetingPointLat?: number;

  @Field(() => Float, { nullable: true })
  meetingPointLng?: number;

  @Field(() => Float, { nullable: true })
  startLocationLat?: number;

  @Field(() => Float, { nullable: true })
  startLocationLng?: number;

  @Field(() => Float, { nullable: true })
  finishLocationLat?: number;

  @Field(() => Float, { nullable: true })
  finishLocationLng?: number;

  @Field(() => [EventParticipant], { nullable: true })
  participants?: EventParticipant[];

  @Field(() => [EventInvitation], { nullable: true })
  invitations?: EventInvitation[];

  // Computed fields
  @Field(() => Int)
  participantCount?: number;
}
