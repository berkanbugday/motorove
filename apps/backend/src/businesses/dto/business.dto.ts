import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { IBusiness } from '@motorove/shared';
import { BusinessCategory } from '../../enums/models/business-category.enum';
import { BusinessDescriptionDto } from './business-description.dto';
import { WorkingHourDto } from './working-hour.dto';
import { AddressDto } from '../../addresses/dto/address.dto';
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

  @Field(() => [WorkingHourDto])
  @IsArray()
  @Type(() => WorkingHourDto)
  workingHours: WorkingHourDto[];

  @Field(() => AddressDto)
  @Type(() => AddressDto)
  address: AddressDto;

  @Field(() => Number)
  @IsNumber()
  @Type(() => Number)
  averageRating: number;

  @Field(() => Int)
  @IsInt()
  @Type(() => Number)
  commentsCount: number;
}
