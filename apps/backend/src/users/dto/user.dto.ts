import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

@ObjectType()
export class UserDto {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  firstName: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  lastName: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  avatar: string | null;

  @Field(() => Date)
  @IsDate()
  createdAt: Date;

  @Field(() => Date)
  @IsDate()
  updatedAt: Date;

  @Field(() => Boolean)
  @IsBoolean()
  isActive: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  followerCount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  followingCount?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isFollowing?: boolean;
}
