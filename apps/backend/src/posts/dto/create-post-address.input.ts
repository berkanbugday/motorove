import { InputType, Field } from '@nestjs/graphql';
import { ICreatePostAddress, Language } from '@motorove/shared';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreatePostAddressInput implements ICreatePostAddress {
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
  @IsOptional()
  @IsString()
  countryCode?: string;
}
