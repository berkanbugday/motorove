import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { City, GroupPrivacy, GroupTag } from 'generated/prisma';
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

registerEnumType(City, {
  name: 'City',
  description: 'The city of the group',
});

registerEnumType(GroupPrivacy, {
  name: 'GroupPrivacy',
  description: 'The privacy of the group',
});

registerEnumType(GroupTag, {
  name: 'GroupTag',
  description: 'The tag of the group',
});
@InputType()
export class CreateGroupInput {
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

  @Field(() => City)
  @IsEnum(City)
  @IsNotEmpty({ message: 'City is required' })
  city: City;

  @Field(() => GroupPrivacy)
  @IsEnum(GroupPrivacy)
  @IsNotEmpty({ message: 'Privacy setting is required' })
  privacy: GroupPrivacy;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt({ message: 'Members capacity must be a whole number' })
  @IsPositive({ message: 'Members capacity must be a positive number' })
  membersCapacity?: number;

  @Field(() => [GroupTag])
  @IsArray()
  @IsEnum(GroupTag, { each: true })
  @ArrayMinSize(1, { message: 'Please select at least 1 tag' })
  @ArrayMaxSize(3, { message: 'You can select up to 3 tags' })
  tags: GroupTag[];
}
