import { ObjectType, Field, Float, ID } from '@nestjs/graphql';
import { Post } from './post.model';
import { Language } from '../../enums/models/language.enum';

@ObjectType()
export class PostAddress {
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

  @Field(() => Post, { nullable: true })
  post?: Partial<Post>;

  @Field(() => String)
  postId: string;
}
