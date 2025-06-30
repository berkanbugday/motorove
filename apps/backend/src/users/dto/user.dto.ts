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
import { IUser } from '@motorove/shared';

@ObjectType()
export class UserDto implements IUser {
  @Field(() => ID)
  @IsUUID()
  declare id: string;

  @Field(() => String)
  @IsEmail()
  declare email: string;

  @Field(() => String)
  @IsString()
  declare firstName: string;

  @Field(() => String)
  @IsString()
  declare lastName: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  declare avatar?: string;

  @Field(() => String)
  @IsString()
  declare supabaseId: string;

  @Field(() => Date)
  @IsDate()
  declare createdAt: Date;

  @Field(() => Date)
  @IsDate()
  declare updatedAt: Date;

  @Field(() => Boolean)
  @IsBoolean()
  declare isActive: boolean;

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
