import { Field, Float, InputType } from '@nestjs/graphql';
import { IsNumber, Min, Max } from 'class-validator';

@InputType()
export class UpdateUserLocationInput {
  @Field(() => Float)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @Field(() => Float)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
