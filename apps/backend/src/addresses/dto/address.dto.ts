import { ObjectType, Field, Float, ID } from '@nestjs/graphql';
import { AddressType } from '../../enums/models/address-type.enum';
import { Language } from '../../enums/models/language.enum';
import { PostDto } from '../../posts/dto/post.dto';
import { EventDto } from '../../events/dto/event.dto';

@ObjectType()
export class AddressDto {
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

  @Field(() => PostDto, { nullable: true })
  post?: PostDto;

  @Field(() => EventDto, { nullable: true })
  event?: EventDto;
}
