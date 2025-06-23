import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { Post } from './post.model';

@ObjectType()
export class PostSave {
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
