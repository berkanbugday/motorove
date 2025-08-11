import { ObjectType, Field, Float, ID } from '@nestjs/graphql';
import { AddressType } from '../../enums/models/address-type.enum';
import { Post } from '../../posts/models/post.model';
import { Event } from '../../events/models/event.model';
import { Language } from '../../enums/models/language.enum';

@ObjectType()
export class Address {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  address: string;

  @Field(() => String)
  language: Language;

  @Field(() => AddressType)
  type: AddressType;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field(() => Post, { nullable: true })
  post?: Post | null;

  @Field(() => String, { nullable: true })
  postId?: string;

  @Field(() => Event, { nullable: true })
  event?: Event | null;

  @Field(() => String, { nullable: true })
  eventId?: string;

  @Field(() => String, { nullable: true })
  country?: string;

  @Field(() => String, { nullable: true })
  businessId?: string;
}
