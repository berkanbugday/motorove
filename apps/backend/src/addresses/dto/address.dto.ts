import { ObjectType, Field, Float, ID } from '@nestjs/graphql';
import { AddressType, Language, IAddress } from '@motorove/shared';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
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
