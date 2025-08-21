import { Field, ObjectType } from '@nestjs/graphql';
import { Group } from '../../groups/models/group.model';
import { BaseModel } from '../../core/models/base.model';
import { Address } from '../../addresses/models/address.model';
import { PostLike } from './post-like.model';
import { PostSave } from './post-save.model';
import { Comment } from '../../comments/models/comment.model';

@ObjectType()
export class Post extends BaseModel {
  @Field()
  content: string;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field(() => Group, { nullable: true })
  group?: Partial<Group>;

  @Field({ nullable: true })
  groupId?: string;

  @Field(() => [PostLike], { nullable: true })
  likes?: PostLike[];

  @Field(() => [PostSave], { nullable: true })
  saves?: PostSave[];

  @Field(() => [Address], { nullable: true })
  addresses?: Address[];

  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];
}
