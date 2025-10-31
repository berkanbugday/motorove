import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ICreateEmergencyAddress } from '@motorove/shared';
import { Language } from '../../enums/models/language.enum';

@InputType()
export class CreateEmergencyAddressInput implements ICreateEmergencyAddress {
  @Field()
  @IsString()
  @IsNotEmpty()
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
