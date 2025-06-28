import { Field, ObjectType, ID } from '@nestjs/graphql';
import { IsDate, IsUUID } from 'class-validator';
import { IPostInteraction } from '@motorove/shared';

@ObjectType()
export class PostInteractionDto implements IPostInteraction {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field()
  @IsUUID()
  postId: string;

  @Field()
  @IsUUID()
  userId: string;

  @Field()
  @IsDate()
  createdAt: Date;
}
