import { InputType, Field } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsDate,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IEventFilter } from '@motorove/shared';
import { EventType } from '../../enums/models/event-type.enum';
import { DifficultyLevel } from '../../enums/models/difficulty-level.enum';
import { ExperienceLevel } from '../../enums/models/experience-level.enum';
import { RoadType } from '../../enums/models/road-type.enum';

@InputType()
export class FilterEventInput implements IEventFilter {
  @Field(() => EventType, { nullable: true })
  @IsEnum(EventType)
  @IsOptional()
  eventType?: EventType;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDateFrom?: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDateTo?: Date;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  query?: string;

  @Field(() => DifficultyLevel, { nullable: true })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficultyLevel?: DifficultyLevel;

  @Field(() => ExperienceLevel, { nullable: true })
  @IsEnum(ExperienceLevel)
  @IsOptional()
  experienceLevel?: ExperienceLevel;

  @Field(() => RoadType, { nullable: true })
  @IsEnum(RoadType)
  @IsOptional()
  roadType?: RoadType;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  groupId?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  createdById?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
