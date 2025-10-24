import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

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

  @Field(() => Int, { nullable: true, defaultValue: 300 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 300;
}
