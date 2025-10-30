import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IBaseDescription } from '@motorove/shared';
import { Language } from '../../enums/models/language.enum';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ObjectType()
export class BaseDescriptionDto implements IBaseDescription {
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
