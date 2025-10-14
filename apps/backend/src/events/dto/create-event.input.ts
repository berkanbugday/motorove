import { InputType, Field, Int } from '@nestjs/graphql';
import { EventType } from '../../enums/models/event-type.enum';
import { RoadType } from '../../enums/models/road-type.enum';
import { DifficultyLevel } from '../../enums/models/difficulty-level.enum';
import { ExperienceLevel } from '../../enums/models/experience-level.enum';
import { EventStatus } from '../../enums/models/event-status.enum';
import { Currency } from '../../enums/models/currency.enum';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  Max,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ICreateEvent } from '@motorove/shared';
import { CreateAddressInput } from '../../addresses/dto/create-address.input';

@InputType()
export class CreateEventInput implements ICreateEvent {
  @Field(() => String)
  @IsString()
  @MaxLength(100)
  title: string;

  @Field(() => String)
  @IsString()
  @MaxLength(1000)
  description: string;

  @Field(() => EventType)
  @IsEnum(EventType)
  eventType: EventType;

  @Field(() => EventStatus)
  @IsEnum(EventStatus)
  status: EventStatus;

  @Field(() => String)
  @IsString()
  startDateTime: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  endDateTime?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @Min(2)
  @Max(1000)
  @IsOptional()
  maxParticipants?: number;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @Field(() => [CreateAddressInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressInput)
  addresses?: CreateAddressInput[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  invitedGroupIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  invitedUserIds?: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  organizedByUserId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  organizedByGroupId?: string;

  // Ride-specific fields
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(RoadType)
  @ValidateIf((o: CreateEventInput) =>
    [
      EventType.SOLO_RIDE,
      EventType.GROUP_RIDE,
      EventType.CAMPING_RIDE,
      EventType.TRAINING,
      EventType.SOCIAL_RESPONSIBILITY,
    ].includes(o.eventType),
  )
  roadType?: RoadType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  @ValidateIf((o: CreateEventInput) =>
    [
      EventType.SOLO_RIDE,
      EventType.GROUP_RIDE,
      EventType.CAMPING_RIDE,
      EventType.TRAINING,
      EventType.SOCIAL_RESPONSIBILITY,
    ].includes(o.eventType),
  )
  difficultyLevel?: DifficultyLevel;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ValidateIf((o: CreateEventInput) =>
    [
      EventType.SOLO_RIDE,
      EventType.GROUP_RIDE,
      EventType.CAMPING_RIDE,
      EventType.TRAINING,
      EventType.SOCIAL_RESPONSIBILITY,
    ].includes(o.eventType),
  )
  routeDescription?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ValidateIf((o: CreateEventInput) =>
    [
      EventType.SOLO_RIDE,
      EventType.GROUP_RIDE,
      EventType.CAMPING_RIDE,
      EventType.TRAINING,
      EventType.SOCIAL_RESPONSIBILITY,
    ].includes(o.eventType),
  )
  restStops?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ValidateIf((o: CreateEventInput) => o.eventType === EventType.CAMPING_RIDE)
  campingInfo?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ValidateIf((o: CreateEventInput) =>
    [
      EventType.SOLO_RIDE,
      EventType.GROUP_RIDE,
      EventType.CAMPING_RIDE,
      EventType.TRAINING,
      EventType.SOCIAL_RESPONSIBILITY,
    ].includes(o.eventType),
  )
  equipmentChecklist?: string;

  // Workshop-specific fields
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ValidateIf((o: CreateEventInput) => o.eventType === EventType.TRAINING)
  instructorInfo?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ValidateIf((o: CreateEventInput) => o.eventType === EventType.TRAINING)
  topicsCovered?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  @ValidateIf((o: CreateEventInput) =>
    [
      EventType.SOLO_RIDE,
      EventType.GROUP_RIDE,
      EventType.CAMPING_RIDE,
      EventType.TRAINING,
      EventType.SOCIAL_RESPONSIBILITY,
    ].includes(o.eventType),
  )
  experienceLevel?: ExperienceLevel;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ValidateIf((o: CreateEventInput) => o.eventType === EventType.TRAINING)
  price?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(Currency)
  @ValidateIf((o: CreateEventInput) => o.eventType === EventType.TRAINING)
  currency?: Currency;
}
