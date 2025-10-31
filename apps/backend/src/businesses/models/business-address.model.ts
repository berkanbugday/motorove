import { ObjectType, Field, Float, ID } from '@nestjs/graphql';
import { Language } from '../../enums/models/language.enum';
import { Business } from './business.model';

@ObjectType()
export class BusinessAddress {
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

  @Field(() => Business, { nullable: true })
  business?: Partial<Business>;

  @Field(() => String)
  businessId: string;
}
