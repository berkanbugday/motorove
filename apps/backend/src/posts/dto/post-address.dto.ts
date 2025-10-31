import { ObjectType, Field } from '@nestjs/graphql';
import { IPostAddress, Language } from '@motorove/shared';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';

@ObjectType()
export class PostAddressDto implements IPostAddress {
  @Field(() => String)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  address: string;

  @Field(() => String, { nullable: true })
  @IsString()
  countryCode?: string;

  @Field(() => Language)
  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;

  @Field(() => Number)
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @Field(() => Number)
  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
