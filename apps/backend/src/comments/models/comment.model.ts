import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../auth/models/user.model';
import { Post } from '../../posts/models/post.model';
import { BaseModel } from '../../core/models/base.model';

@ObjectType()
export class Comment extends BaseModel {
  @Field()
  content: string;

  @Field(() => User)
  author: Partial<User>;

  @Field()
  authorId: string;

  @Field(() => Post)
  post: Partial<Post>;

  @Field()
  postId: string;

  @Field(() => ID, { nullable: true })
  parentId?: string;

  @Field(() => Comment, { nullable: true })
  parent?: Comment;

  @Field(() => [Comment], { nullable: true })
  replies?: Comment[];
}
