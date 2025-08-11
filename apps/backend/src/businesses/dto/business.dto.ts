import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IBusiness } from '@motorove/shared';
import { BusinessCategory } from '../../enums/models/business-category.enum';
import { BusinessDescriptionDto } from './business-description.dto';
import { WorkingHourDto } from './working-hour.dto';
import { AddressDto } from '../../addresses/dto/address.dto';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

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
  mainCategory: BusinessCategory;

  @Field(() => [BusinessCategory])
  @IsArray()
  @IsEnum(BusinessCategory, { each: true })
  subCategories: BusinessCategory[];

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
}
