import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { AddressType } from '../../enums/models/address-type.enum';
import { Language } from '../../enums/models/language.enum';

@InputType()
export class FilterAddressInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  postId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  eventId?: string;

  @Field(() => AddressType, { nullable: true })
  @IsOptional()
  @IsEnum(AddressType)
  type?: AddressType;

  @Field(() => Language, { nullable: true })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;
}
