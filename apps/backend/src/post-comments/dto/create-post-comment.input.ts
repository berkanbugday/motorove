import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ICreatePostComment } from '@motorove/shared';

@InputType()
export class CreatePostCommentInput implements ICreatePostComment {
  @Field()
  @IsNotEmpty()
  @IsString()
  content: string;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  postId: string;
}
