import { ObjectType, Field } from '@nestjs/graphql';
import { IEventAddress, Language } from '@motorove/shared';
import { AddressType } from '../../enums/models/address-type.enum';

import {
  IsEnum,
  IsNotEmpty,
  IsUUID,
  IsString,
  IsNumber,
} from 'class-validator';

@ObjectType()
export class EventAddressDto implements IEventAddress {
  @Field(() => String)
  @IsUUID()
  id: string;

  @Field(() => AddressType)
  @IsEnum(AddressType)
  type: AddressType;

  @Field(() => String)
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @Field(() => String)
  @IsString()
  address: string;

  @Field(() => Language)
  @IsEnum(Language)
  language: Language;

  @Field(() => String)
  @IsString()
  countryCode?: string;

  @Field(() => Number)
  @IsNumber()
  latitude: number;
  longitude: number;
}
