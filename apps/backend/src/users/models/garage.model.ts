import { Field, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../core/models/base.model';
import { Motorcycle } from './motorcycle.model';
import { Equipment } from './equipment.model';

@ObjectType()
export class Garage extends BaseModel {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => [Equipment], { nullable: true })
  equipments?: Equipment[];

  @Field(() => [Motorcycle], { nullable: true })
  motorcycles?: Motorcycle[];
}
