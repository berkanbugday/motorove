import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import { Group } from '../../groups/models/group.model';
import { EventParticipant } from './event-participant.model';
import { EventInvitation } from './event-invitation.model';
import { BaseModel } from '../../core/models/base.model';
import {
  EventType,
  DifficultyLevel,
  RoadType,
  ExperienceLevel,
} from '@motorove/shared';
import { User } from 'src/users/models/user.model';
import { Address } from 'src/addresses/models/address.model';

@ObjectType()
export class Event extends BaseModel {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  @Field(() => EventType)
  eventType: EventType;

  @Field(() => Date)
  startDateTime: Date;

  @Field(() => Date, { nullable: true })
  endDateTime?: Date;

  @Field(() => Int, { nullable: true })
  maxParticipants?: number;

  @Field(() => Boolean)
  isPrivate: boolean;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field(() => [String], { nullable: true })
  invitedUserIds?: string[];

  @Field(() => [String], { nullable: true })
  invitedGroupIds?: string[];

  @Field(() => [Address], { nullable: true })
  addresses?: Address[];

  @Field(() => RoadType, { nullable: true })
  roadType?: RoadType;

  @Field(() => DifficultyLevel, { nullable: true })
  difficultyLevel?: DifficultyLevel;

  @Field(() => String, { nullable: true })
  routeDescription?: string;

  @Field(() => String, { nullable: true })
  restStops?: string;

  @Field(() => String, { nullable: true })
  campingInfo?: string;

  @Field(() => String, { nullable: true })
  equipmentChecklist?: string;

  @Field(() => String, { nullable: true })
  instructorInfo?: string;

  @Field(() => String, { nullable: true })
  topicsCovered?: string;

  @Field(() => ExperienceLevel, { nullable: true })
  experienceLevel?: ExperienceLevel;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field(() => [EventParticipant], { nullable: true })
  participants?: EventParticipant[];

  @Field(() => [EventInvitation], { nullable: true })
  invitations?: EventInvitation[];

  @Field(() => [Group], { nullable: true })
  invitedGroups?: Group[];

  @Field(() => [User], { nullable: true })
  invitedUsers?: User[];
}
