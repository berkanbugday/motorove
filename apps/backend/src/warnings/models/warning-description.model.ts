import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Language } from '../../enums/models/language.enum';

@ObjectType()
export class WarningDescription {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  description: string;

  @Field(() => Language)
  language: Language;

  @Field(() => Boolean)
  isActive: boolean;
}
