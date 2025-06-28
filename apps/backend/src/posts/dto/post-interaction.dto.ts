import { Field, ObjectType, ID } from '@nestjs/graphql';
import { IsDate, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from '../../users/dto/user.dto';
import { PostDto } from './post.dto';

@ObjectType()
export class PostInteractionDto {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => PostDto)
  @ValidateNested()
  @Type(() => PostDto)
  post: Partial<PostDto>;

  @Field()
  @IsUUID()
  postId: string;

  @Field(() => UserDto)
  @ValidateNested()
  @Type(() => UserDto)
  user: Partial<UserDto>;

  @Field()
  @IsUUID()
  userId: string;

  @Field()
  @IsDate()
  createdAt: Date;
}
