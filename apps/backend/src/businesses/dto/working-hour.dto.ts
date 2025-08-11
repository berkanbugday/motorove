import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IWorkingHour } from '@motorove/shared';
import { DayOfWeek } from '../../enums/models/day-of-week.enum';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

@ObjectType()
export class WorkingHourDto implements IWorkingHour {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => DayOfWeek)
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @Field(() => String)
  @IsString()
  startHour: string;

  @Field(() => String)
  @IsString()
  endHour: string;

  @Field(() => Boolean)
  @IsBoolean()
  isOpen24h: boolean;
}
