import { Field, InputType, ID, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreatePostInput } from './create-post.input';
import { IUpdatePost } from '@motorove/shared';

@InputType()
export class UpdatePostInput
  extends PartialType(CreatePostInput)
  implements IUpdatePost
{
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
