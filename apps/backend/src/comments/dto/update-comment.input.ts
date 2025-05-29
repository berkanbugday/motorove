import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class UpdateCommentInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;
}
