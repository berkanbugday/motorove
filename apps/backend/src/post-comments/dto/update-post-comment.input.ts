import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { IUpdatePostComment } from '@motorove/shared';

@InputType()
export class UpdatePostCommentInput implements IUpdatePostComment {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;
}
