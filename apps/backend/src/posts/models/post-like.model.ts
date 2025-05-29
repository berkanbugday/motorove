import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../auth/models/user.model';
import { Post } from './post.model';

@ObjectType()
export class PostLike {
  @Field(() => ID)
  id: string;

  @Field(() => Post)
  post: Partial<Post>;

  @Field()
  postId: string;

  @Field(() => User)
  user: Partial<User>;

  @Field()
  userId: string;

  @Field()
  createdAt: Date;
}
