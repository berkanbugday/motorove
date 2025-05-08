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
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CityInput } from '../../cities/dto/city.input';
import { GroupTagInput } from '../../group-tags/dto/group-tag.input';

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

  @Field(() => CityInput)
  @ValidateNested()
  @Type(() => CityInput)
  @IsNotEmpty({ message: 'City is required' })
  city: CityInput;

  @Field(() => GroupPrivacy)
  @IsEnum(GroupPrivacy)
  @IsNotEmpty({ message: 'Privacy setting is required' })
  privacy: GroupPrivacy;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt({ message: 'Members capacity must be a whole number' })
  @IsPositive({ message: 'Members capacity must be a positive number' })
  membersCapacity?: number;

  @Field(() => [GroupTagInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupTagInput)
  @ArrayMinSize(1, { message: 'Please select at least 1 tag' })
  @ArrayMaxSize(3, { message: 'You can select up to 3 tags' })
  tags: GroupTagInput[];
}
