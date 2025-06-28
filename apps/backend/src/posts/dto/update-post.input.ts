import { Field, InputType, ID, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { IUpdatePost } from '@motorove/shared';
import { CreatePostInput } from './create-post.input';

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
