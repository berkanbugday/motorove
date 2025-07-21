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
import { AddressDto } from 'src/addresses/dto/address.dto';
import { CommentDto } from 'src/comments/dto/comment.dto';
import { IPost } from '@motorove/shared';
import { GroupDto } from 'src/groups/dto/group.dto';

@ObjectType()
export class PostDto implements IPost {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field()
  @IsString()
  content: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  images?: string[];

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

  @Field(() => [AddressDto], { nullable: true })
  @ValidateNested()
  @Type(() => AddressDto)
  addresses?: AddressDto[];

  @Field(() => [CommentDto], { nullable: true })
  @ValidateNested()
  @Type(() => CommentDto)
  comments?: CommentDto[];

  @Field(() => GroupDto, { nullable: true })
  @ValidateNested()
  @Type(() => GroupDto)
  group?: GroupDto;
}
