import { Field, InputType } from '@nestjs/graphql';
import { ICreateWarningAddress, Language } from '@motorove/shared';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateWarningAddressInput implements ICreateWarningAddress {
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
  @IsOptional()
  countryCode?: string;
}
