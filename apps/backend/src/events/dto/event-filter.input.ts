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
import { EventType } from '../../enums/models/event-type.enum';
import { DifficultyLevel } from '../../enums/models/difficulty-level.enum';
import { ExperienceLevel } from '../../enums/models/experience-level.enum';
import { RoadType } from '../../enums/models/road-type.enum';
import { Language } from '../../enums/models/language.enum';

@InputType()
export class EventFilterInput {
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
  searchTerm?: string;

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

  @Field(() => Language, { nullable: true })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;
}
