import { InputType, Field } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsDate,
  IsEnum,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { Gender } from '../../enums/models/gender.enum';
import { RidingStyle } from '../../enums/models/riding-style.enum';
import { Interest } from '../../enums/models/interest.enum';
import { IAccountSetup } from '@motorove/shared';

@InputType()
export class AccountSetupInput implements IAccountSetup {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  cityId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDate()
  dateOfBirth?: Date | null;

  @Field(() => Gender, { nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender | null;

  @Field(() => [RidingStyle], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(RidingStyle, { each: true })
  ridingStyles?: RidingStyle[] | null;

  @Field(() => [Interest], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(Interest, { each: true })
  interests?: Interest[] | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string | null;
}
