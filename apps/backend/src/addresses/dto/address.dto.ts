import { ObjectType, Field, Float, ID } from '@nestjs/graphql';
import { IAddress } from '@motorove/shared';
import { AddressType } from '../../enums/models/address-type.enum';
import { Language } from '../../enums/models/language.enum';

import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  IsOptional,
} from 'class-validator';

@ObjectType()
export class AddressDto implements IAddress {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  address: string;

  @Field(() => String)
  @IsString()
  @IsOptional()
  country?: string;

  @Field(() => Language)
  @IsEnum(Language)
  language: Language;

  @Field(() => AddressType)
  @IsEnum(AddressType)
  type: AddressType;

  @Field(() => Float)
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @Field(() => Float)
  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
