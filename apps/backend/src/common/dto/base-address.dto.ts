import { ObjectType, Field, Float, ID } from '@nestjs/graphql';
import { IBaseAddress } from '@motorove/shared';
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
export class BaseAddressDto implements IBaseAddress {
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

  @Field(() => Float)
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @Field(() => Float)
  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
