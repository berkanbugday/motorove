import { Field, ObjectType, ID } from '@nestjs/graphql';
import { IsString, IsUUID, IsEnum } from 'class-validator';
import { Language } from '../../enums/models/language.enum';
import { IWarningDescription } from '@motorove/shared/dist';

@ObjectType()
export class WarningDescriptionDto implements IWarningDescription {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field()
  @IsString()
  description: string;

  @Field(() => Language)
  @IsEnum(Language)
  language: Language;
}
