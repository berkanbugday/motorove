import { InputType, Field } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsDate,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class EventFilterInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  eventType?: string;

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

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  difficultyLevel?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  experienceLevel?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  roadType?: string;

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
}
