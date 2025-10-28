import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Language } from '../../enums/models/language.enum';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

@ObjectType()
export class BusinessDescription {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field(() => Language)
  @IsEnum(Language)
  language: Language;

  @Field(() => Boolean)
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
