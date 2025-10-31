import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from '../../posts/models/post.model';
import { BaseModel } from '../../core/models/base.model';

@ObjectType()
export class PostComment extends BaseModel {
  @Field()
  content: string;

  @Field(() => Post)
  post: Partial<Post>;

  @Field()
  postId: string;
}
