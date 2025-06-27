import { Field, ObjectType, ID, Float } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from '../../users/dto/user.dto';

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

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number | null;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number | null;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  groupId?: string;

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

  @Field()
  @IsBoolean()
  isActive: boolean;
}
