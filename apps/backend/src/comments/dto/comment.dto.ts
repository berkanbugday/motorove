import { Field, ObjectType, ID } from '@nestjs/graphql';
import { IsUUID, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PostDto } from '../../posts/dto/post.dto';
import { IComment } from '@motorove/shared';
import { BaseDto } from '../../core/models/base.dto';

@ObjectType()
export class CommentDto extends BaseDto implements IComment {
  @Field()
  @IsString()
  content: string;

  @Field(() => ID)
  @IsUUID()
  postId: string;

  @Field(() => PostDto, { nullable: true })
  @ValidateNested()
  @Type(() => PostDto)
  post?: PostDto;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  parentId?: string;

  @Field(() => CommentDto, { nullable: true })
  @ValidateNested()
  @Type(() => CommentDto)
  parent?: CommentDto;

  @Field(() => [CommentDto], { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => CommentDto)
  replies?: CommentDto[];
}
