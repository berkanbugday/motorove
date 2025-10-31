import { ObjectType, Field, Float, ID } from '@nestjs/graphql';
import { AddressType } from '../../enums/models/address-type.enum';
import { Event } from './event.model';
import { Language } from '../../enums/models/language.enum';

@ObjectType()
export class EventAddress {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  address: string;

  @Field(() => String, { nullable: true })
  countryCode?: string;

  @Field(() => Language)
  language: Language;

  @Field(() => AddressType)
  type: AddressType;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field(() => Event, { nullable: true })
  event?: Partial<Event>;

  @Field(() => String)
  eventId: string;
}
