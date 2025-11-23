import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Language } from '../../enums/models/language.enum';

@ObjectType()
export class AuthUser {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field(() => Language, { defaultValue: Language.EN })
  preferredLanguage: Language;
}
