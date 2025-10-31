import { Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsEnum } from 'class-validator';
import { IEmergencyDescription } from '@motorove/shared';
import { Language } from '../../enums/models/language.enum';

@ObjectType()
export class EmergencyDescriptionDto implements IEmergencyDescription {
  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  description: string;

  @Field(() => Language)
  @IsEnum(Language)
  language: Language;
}
