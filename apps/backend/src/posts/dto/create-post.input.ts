import { Field, InputType, Float } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsUUID,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class PostAddressInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  address: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  language: string;
}

@InputType()
export class CreatePostInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  content: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @Field(() => [PostAddressInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostAddressInput)
  addresses?: PostAddressInput[];
}
