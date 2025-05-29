import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import { Group } from '../../groups/models/group.model';
import { Comment } from '../../comments/models/comment.model';
import { BaseModel } from '../../core/models/base.model';

@ObjectType()
export class Post extends BaseModel {
  @Field()
  content: string;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field(() => Float, { nullable: true })
  latitude?: number | null;

  @Field(() => Float, { nullable: true })
  longitude?: number | null;

  @Field(() => Group, { nullable: true })
  group?: Partial<Group>;

  @Field({ nullable: true })
  groupId?: string;

  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];

  @Field(() => Int, { defaultValue: 0 })
  likesCount: number;

  @Field(() => Int, { defaultValue: 0 })
  savesCount: number;

  @Field(() => Int, { defaultValue: 0 })
  commentsCount: number;

  @Field(() => Boolean, { defaultValue: false })
  isLiked: boolean;

  @Field(() => Boolean, { defaultValue: false })
  isSaved: boolean;
}
