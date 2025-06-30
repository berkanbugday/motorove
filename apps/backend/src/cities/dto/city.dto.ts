import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ICity } from '@motorove/shared';

@ObjectType()
export class CityDto implements ICity {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  value: string;
}
