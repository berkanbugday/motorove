import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNumber, IsOptional, Min, Max, IsEnum } from 'class-validator';
import { EmergencyType } from '../../enums/models/emergency-type.enum';

@InputType()
export class FilterEmergencyInput {
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

  @Field(() => EmergencyType, { nullable: true })
  @IsOptional()
  @IsEnum(EmergencyType)
  type?: EmergencyType;
}
