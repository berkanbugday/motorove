import { Field, ObjectType, ID, Float } from '@nestjs/graphql';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Language } from '../../enums/models/language.enum';
import { IWarningAddress } from '@motorove/shared';

@ObjectType()
export class WarningAddressDto implements IWarningAddress {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field()
  @IsString()
  address: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @Field(() => Language)
  @IsEnum(Language)
  language: Language;

  @Field(() => Float)
  @IsNumber()
  latitude: number;

  @Field(() => Float)
  @IsNumber()
  longitude: number;
}
