import { ObjectType, Field, ID } from '@nestjs/graphql';
import { DayOfWeek } from '../../enums/models/day-of-week.enum';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
} from 'class-validator';

@ObjectType()
export class WorkingHour {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => DayOfWeek)
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  startHour: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  endHour: string;

  @Field(() => Boolean)
  @IsBoolean()
  isOpen24h: boolean;

  @Field(() => Boolean)
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
