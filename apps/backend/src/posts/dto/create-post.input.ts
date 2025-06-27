import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressInput } from '../../addresses/dto/create-address.input';

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

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @Field(() => [CreateAddressInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressInput)
  addresses?: CreateAddressInput[];
}
