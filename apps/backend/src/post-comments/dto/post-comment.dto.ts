import { Field, ObjectType, ID } from '@nestjs/graphql';
import { IsUUID, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PostDto } from '../../posts/dto/post.dto';
import { IPostComment } from '@motorove/shared';
import { BaseDto } from '../../core/models/base.dto';

@ObjectType()
export class PostCommentDto extends BaseDto implements IPostComment {
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

  @Field(() => PostCommentDto, { nullable: true })
  @ValidateNested()
  @Type(() => PostCommentDto)
  parent?: PostCommentDto;

  @Field(() => [PostCommentDto], { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => PostCommentDto)
  replies?: PostCommentDto[];
}
