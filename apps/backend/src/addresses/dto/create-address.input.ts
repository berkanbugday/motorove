import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ICreateAddress } from '@motorove/shared';
import { AddressType } from '../../enums/models/address-type.enum';
import { Language } from '../../enums/models/language.enum';

@InputType()
export class CreateAddressInput implements ICreateAddress {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  address: string;

  @Field(() => Language)
  @IsNotEmpty()
  @IsEnum(Language)
  language: Language;

  @Field(() => AddressType)
  @IsNotEmpty()
  type: AddressType;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  postId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  eventId?: string;
}
