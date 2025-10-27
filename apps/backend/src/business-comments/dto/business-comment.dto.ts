import { Field, ObjectType, ID, Int } from '@nestjs/graphql';
import {
  IsUUID,
  IsString,
  IsInt,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessDto } from '../../businesses/dto/business.dto';
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

  @Field(() => ID)
  @IsUUID()
  businessId: string;

  @Field(() => BusinessDto, { nullable: true })
  @ValidateNested()
  @Type(() => BusinessDto)
  business?: BusinessDto;
}
