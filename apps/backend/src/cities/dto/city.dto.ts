import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@ObjectType()
export class CityDto {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field()
  @IsString()
  value: string;
}
