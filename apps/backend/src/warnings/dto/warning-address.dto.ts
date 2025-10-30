import { Field, ObjectType, ID, Float } from '@nestjs/graphql';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Language } from '../../enums/models/language.enum';
import { IBaseAddress } from '@motorove/shared/dist';

@ObjectType()
export class WarningAddressDto implements IBaseAddress {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field()
  @IsString()
  address: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

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
