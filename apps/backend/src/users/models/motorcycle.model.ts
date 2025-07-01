import { Field, ObjectType, Int } from '@nestjs/graphql';
import { BaseModel } from '../../core/models/base.model';
import { Garage } from './garage.model';

@ObjectType()
export class Motorcycle extends BaseModel {
  @Field(() => String)
  brand: string;

  @Field(() => String)
  model: string;

  @Field(() => Int, { nullable: true })
  year?: number;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field(() => String)
  garageId: string;

  @Field(() => Garage)
  garage: Garage;
}
