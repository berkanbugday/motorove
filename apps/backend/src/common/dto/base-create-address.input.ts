import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { IBaseCreateAddress } from '@motorove/shared';
import { Language } from '../../enums/models/language.enum';

@InputType()
export class BaseCreateAddressInput implements IBaseCreateAddress {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  address: string;

  @Field(() => Language)
  @IsNotEmpty()
  @IsEnum(Language)
  language: Language;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  country?: string;
}
