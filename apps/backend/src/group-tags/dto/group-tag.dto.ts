import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';
import { IGroupTag } from '@motorove/shared';

@ObjectType()
export class GroupTagDto implements IGroupTag {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field()
  @IsString()
  value: string;
}
