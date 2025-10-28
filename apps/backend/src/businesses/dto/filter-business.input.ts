import { InputType, Field, Float, Int } from '@nestjs/graphql';
import {
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsBoolean,
  IsString,
  IsEnum,
} from 'class-validator';
import { BusinessCategory } from '../../enums/models/business-category.enum';

@InputType()
export class FilterBusinessInput {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  northEastLat?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  northEastLng?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  southWestLat?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  southWestLng?: number;

  @Field(() => Int, { nullable: true, defaultValue: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @Field(() => [BusinessCategory], { nullable: true })
  @IsOptional()
  @IsEnum(BusinessCategory, { each: true })
  categories?: BusinessCategory[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(3)
  @Max(5)
  minRating?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isOpen24h?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  searchQuery?: string;
}
