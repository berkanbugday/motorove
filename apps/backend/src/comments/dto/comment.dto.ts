import { Field, ObjectType, ID } from '@nestjs/graphql';
import { IsUUID, IsDate, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from '../../users/dto/user.dto';
import { PostDto } from '../../posts/dto/post.dto';

@ObjectType()
export class CommentDto {
  @Field(() => ID)
  @IsUUID()
  id: string;

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

  @Field(() => UserDto)
  @ValidateNested()
  @Type(() => UserDto)
  createdBy: UserDto;

  @Field()
  @IsUUID()
  createdById: string;

  @Field()
  @IsDate()
  createdAt: Date;

  @Field(() => UserDto)
  @ValidateNested()
  @Type(() => UserDto)
  updatedBy: UserDto;

  @Field()
  @IsUUID()
  updatedById: string;

  @Field()
  @IsDate()
  updatedAt: Date;
}
