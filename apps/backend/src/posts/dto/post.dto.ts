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
import { GroupDto } from '../../groups/dto/group.dto';
import { AddressDto } from 'src/addresses/dto/address.dto';
import { CommentDto } from 'src/comments/dto/comment.dto';

@ObjectType()
export class PostDto {
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

  @Field(() => GroupDto)
  @ValidateNested()
  @Type(() => GroupDto)
  group: GroupDto;

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

  @Field(() => [AddressDto])
  @ValidateNested()
  @Type(() => AddressDto)
  addresses: AddressDto[];

  @Field(() => [CommentDto])
  @ValidateNested()
  @Type(() => CommentDto)
  comments: CommentDto[];
}
