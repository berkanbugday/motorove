import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString, IsUUID } from 'class-validator';

@ObjectType()
export class GroupTagDto {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field()
  @IsString()
  value: string;

  @Field()
  @IsBoolean()
  isActive: boolean;
}
