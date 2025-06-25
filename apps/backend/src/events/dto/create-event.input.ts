import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { EventType } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsDate,
  IsUUID,
  IsArray,
  Min,
  Max,
  MaxLength,
  ValidateIf,
} from 'class-validator';

@InputType()
export class CreateEventInput {
  @Field(() => String)
  @IsString()
  @MaxLength(100)
  title: string;

  @Field(() => String)
  @IsString()
  @MaxLength(1000)
  description: string;

  @Field(() => String)
  @IsEnum(EventType)
  eventType: string;

  @Field(() => Date)
  @IsDate()
  startDateTime: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  endDateTime?: Date;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  meetingPoint?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  startLocation?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  finishLocation?: string;

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

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  groupId?: string;

  // Ride-specific fields
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ValidateIf((o) =>
    ['SOLO_RIDE', 'GROUP_RIDE', 'CAMPING_RIDE', 'CHARITY_RIDE'].includes(
      o.eventType,
    ),
  )
  roadType?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ValidateIf((o) =>
    ['SOLO_RIDE', 'GROUP_RIDE', 'CAMPING_RIDE', 'CHARITY_RIDE'].includes(
      o.eventType,
    ),
  )
  difficultyLevel?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  routeDescription?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  restStops?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.eventType === 'CAMPING_RIDE')
  campingInfo?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  equipmentChecklist?: string;

  // Workshop-specific fields
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.eventType === 'WORKSHOP_TRAINING')
  instructorInfo?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.eventType === 'WORKSHOP_TRAINING')
  topicsCovered?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.eventType === 'WORKSHOP_TRAINING')
  experienceLevel?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  price?: string;

  // Coordinates for locations
  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  meetingPointLat?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  meetingPointLng?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  startLocationLat?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  startLocationLng?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  finishLocationLat?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  finishLocationLng?: number;
}
