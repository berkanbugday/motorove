import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';
import { ICreateComment } from '@motorove/shared';

@InputType()
export class CreateCommentInput implements ICreateComment {
  @Field()
  @IsNotEmpty()
  @IsString()
  content: string;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  postId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
