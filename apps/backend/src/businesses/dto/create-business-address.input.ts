import { Field, InputType } from '@nestjs/graphql';
import { ICreateBusinessAddress, Language } from '@motorove/shared';
import { IsEnum, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateBusinessAddressInput implements ICreateBusinessAddress {
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

  @Field(() => String)
  @IsString()
  countryCode?: string;
}
