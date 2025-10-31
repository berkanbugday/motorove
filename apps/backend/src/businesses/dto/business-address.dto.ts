import { ObjectType, Field } from '@nestjs/graphql';
import { IBusinessAddress, Language } from '@motorove/shared';
import { IsUUID, IsString, IsEnum, IsNumber } from 'class-validator';

@ObjectType()
export class BusinessAddressDto implements IBusinessAddress {
  @Field(() => String)
  @IsUUID()
  id: string;

  @Field(() => String)
  @IsString()
  address: string;

  @Field(() => String)
  @IsString()
  countryCode?: string;

  @Field(() => Language)
  @IsEnum(Language)
  language: Language;

  @Field(() => Number)
  @IsNumber()
  latitude: number;

  @Field(() => Number)
  @IsNumber()
  longitude: number;
}
