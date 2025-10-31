import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { IBusiness } from '@motorove/shared';
import { BusinessCategory } from '../../enums/models/business-category.enum';
import { BusinessDescriptionDto } from './business-description.dto';
import { WorkingHourDto } from './working-hour.dto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { BusinessAddressDto } from './business-address.dto';

@ObjectType()
export class BusinessDto implements IBusiness {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => BusinessCategory)
  @IsEnum(BusinessCategory)
  category: BusinessCategory;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @Field(() => [BusinessDescriptionDto])
  @IsArray()
  @Type(() => BusinessDescriptionDto)
  descriptions: BusinessDescriptionDto[];

  @Field(() => [BusinessAddressDto])
  @IsArray()
  @Type(() => BusinessAddressDto)
  addresses: BusinessAddressDto[];

  @Field(() => [WorkingHourDto])
  @IsArray()
  @Type(() => WorkingHourDto)
  workingHours: WorkingHourDto[];

  @Field(() => Number)
  @IsNumber()
  @Type(() => Number)
  averageRating: number;

  @Field(() => Int)
  @IsInt()
  @Type(() => Number)
  commentsCount: number;
}
