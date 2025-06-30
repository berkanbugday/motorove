import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { IUpdateComment } from '@motorove/shared';

@InputType()
export class UpdateCommentInput implements IUpdateComment {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;
}
