import { Field, ObjectType, Float } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { IEmergencyAddress } from '@motorove/shared';
import { Language } from '../../enums/models/language.enum';

@ObjectType()
export class EmergencyAddressDto implements IEmergencyAddress {
  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  address: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @Field(() => Float)
  @IsNumber()
  latitude: number;

  @Field(() => Float)
  @IsNumber()
  longitude: number;

  @Field(() => Language)
  @IsEnum(Language)
  language: Language;
}
