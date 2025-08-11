import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IBusinessDescription } from '@motorove/shared';
import { Language } from '../../enums/models/language.enum';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ObjectType()
export class BusinessDescriptionDto implements IBusinessDescription {
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
}
