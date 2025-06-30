import { InputType, Field, Int } from '@nestjs/graphql';
import { GroupPrivacy } from '../../enums/models/group-privacy.enum';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsArray,
  MinLength,
  MaxLength,
  IsInt,
  IsPositive,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ICreateGroup } from '@motorove/shared';

@InputType()
export class CreateGroupInput implements ICreateGroup {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Group name must be at least 3 characters' })
  @MaxLength(100, { message: 'Group name must be at most 100 characters' })
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  logo?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cover?: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'City is required' })
  cityId: string;

  @Field(() => GroupPrivacy)
  @IsEnum(GroupPrivacy)
  @IsNotEmpty({ message: 'Privacy setting is required' })
  privacy: GroupPrivacy;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt({ message: 'Members capacity must be a whole number' })
  @IsPositive({ message: 'Members capacity must be a positive number' })
  membersCapacity?: number;

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1, { message: 'Please select at least 1 tag' })
  @ArrayMaxSize(3, { message: 'You can select up to 3 tags' })
  tagIds: string[];
}
