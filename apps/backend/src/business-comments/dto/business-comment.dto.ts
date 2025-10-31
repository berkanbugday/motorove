import { Field, ObjectType, Int } from '@nestjs/graphql';
import { IsString, IsInt, Min, Max } from 'class-validator';
import { IBusinessComment } from '@motorove/shared';
import { BaseDto } from '../../core/models/base.dto';

@ObjectType()
export class BusinessCommentDto extends BaseDto implements IBusinessComment {
  @Field()
  @IsString()
  content: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}
