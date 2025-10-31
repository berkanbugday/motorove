import { Field, ObjectType, ID, Int } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from '../../users/dto/user.dto';
import { IPost } from '@motorove/shared';
import { PostCommentDto } from '../../post-comments/dto/post-comment.dto';
import { ImageDto } from '../../common/dto/image.dto';
import { PostAddressDto } from './post-address.dto';

@ObjectType()
export class PostDto implements IPost {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field()
  @IsString()
  content: string;

  @Field(() => [ImageDto], { nullable: true })
  @IsOptional()
  @IsArray()
  images?: ImageDto[];

  @Field(() => Int)
  @IsNumber()
  likesCount: number;

  @Field(() => Int)
  @IsNumber()
  commentsCount: number;

  @Field(() => Boolean)
  @IsBoolean()
  isLiked: boolean;

  @Field(() => Boolean)
  @IsBoolean()
  isSaved: boolean;

  @Field(() => UserDto)
  @ValidateNested()
  @Type(() => UserDto)
  createdBy: UserDto;

  @Field()
  @IsDate()
  createdAt: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  groupId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  groupName?: string;

  @Field(() => [PostAddressDto], { nullable: true })
  @ValidateNested()
  @Type(() => PostAddressDto)
  addresses?: PostAddressDto[];

  @Field(() => [UserDto], { nullable: true })
  @ValidateNested()
  @Type(() => UserDto)
  likedUsers?: UserDto[];

  @Field(() => [PostCommentDto], { nullable: true })
  @ValidateNested()
  @Type(() => PostCommentDto)
  comments?: PostCommentDto[];
}
