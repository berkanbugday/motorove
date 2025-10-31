import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import {
  IsUUID,
  IsDate,
  IsBoolean,
  IsString,
  IsArray,
  IsOptional,
  IsInt,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from '../../users/dto/user.dto';
import { EventType } from '../../enums/models/event-type.enum';
import { RoadType } from '../../enums/models/road-type.enum';
import { DifficultyLevel } from '../../enums/models/difficulty-level.enum';
import { ExperienceLevel } from '../../enums/models/experience-level.enum';
import { EventParticipantStatus } from '../../enums/models/event-participant-status.enum';
import { EventStatus } from '../../enums/models/event-status.enum';
import { Currency } from '../../enums/models/currency.enum';
import { GroupDto } from '../../groups/dto/group.dto';
import { EventParticipantDto } from './event-participant.dto';
import { IEvent } from '@motorove/shared';
import { ImageDto } from '../../common/dto/image.dto';
import { EventAddressDto } from './event-address.dto';

@ObjectType()
export class EventDto implements IEvent {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String)
  @IsString()
  description: string;

  @Field(() => EventType)
  eventType: EventType;

  @Field(() => EventStatus)
  status: EventStatus;

  @Field(() => Date)
  @IsDate()
  startDateTime: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  endDateTime?: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  maxParticipants?: number;

  @Field(() => Boolean)
  @IsBoolean()
  isPrivate: boolean;

  @Field(() => [ImageDto], { nullable: true })
  @IsOptional()
  @IsArray()
  images?: ImageDto[];

  @Field(() => [EventAddressDto], { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EventAddressDto)
  addresses?: EventAddressDto[];

  @Field(() => RoadType, { nullable: true })
  @IsOptional()
  roadType?: RoadType;

  @Field(() => DifficultyLevel, { nullable: true })
  @IsOptional()
  difficultyLevel?: DifficultyLevel;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  routeDescription?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  restStops?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  campingInfo?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  equipmentChecklist?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  instructorInfo?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  topicsCovered?: string;

  @Field(() => ExperienceLevel, { nullable: true })
  @IsOptional()
  experienceLevel?: ExperienceLevel;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  price?: number;

  @Field(() => Currency, { nullable: true })
  @IsOptional()
  currency?: Currency;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  participantsCount?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isParticipating?: boolean;

  @Field(() => EventParticipantStatus, { nullable: true })
  @IsOptional()
  participationStatus?: EventParticipantStatus;

  @Field(() => UserDto)
  @ValidateNested()
  @Type(() => UserDto)
  createdBy: UserDto;

  @Field()
  @IsUUID()
  createdById: string;

  @Field()
  @IsDate()
  createdAt: Date;

  @Field(() => UserDto)
  @ValidateNested()
  @Type(() => UserDto)
  updatedBy: UserDto;

  @Field()
  @IsUUID()
  updatedById: string;

  @Field()
  @IsDate()
  updatedAt: Date;

  @Field()
  @IsBoolean()
  isActive: boolean;

  @Field(() => GroupDto, { nullable: true })
  @ValidateNested()
  @Type(() => GroupDto)
  @IsOptional()
  organizedByGroup?: GroupDto;

  @Field(() => [GroupDto], { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => GroupDto)
  @IsOptional()
  invitedGroups?: GroupDto[];

  @Field(() => [EventParticipantDto], { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => EventParticipantDto)
  @IsOptional()
  participants?: EventParticipantDto[];
}
