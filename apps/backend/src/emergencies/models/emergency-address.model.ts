import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Language } from '../../enums/models/language.enum';

@ObjectType()
export class EmergencyAddress {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  address: string;

  @Field(() => String, { nullable: true })
  countryCode?: string;

  @Field(() => Language)
  language: Language;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;
}
