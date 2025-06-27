import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsUUID, IsBoolean } from 'class-validator';

@InputType()
export class CommentFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  postId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  createdById?: string;
}
