import { InputType, Field } from '@nestjs/graphql';
import { ICreateEventAddress, Language } from '@motorove/shared';
import { AddressType } from '../../enums/models/address-type.enum';

import { IsEnum, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateEventAddressInput implements ICreateEventAddress {
  @Field(() => AddressType)
  @IsEnum(AddressType)
  type: AddressType;

  @Field(() => Number)
  @IsNumber()
  latitude: number;

  @Field(() => Number)
  @IsNumber()
  longitude: number;

  @Field(() => String)
  @IsString()
  address: string;

  @Field(() => Language)
  @IsEnum(Language)
  language: Language;

  @Field(() => String, { nullable: true })
  @IsString()
  countryCode?: string;
}
