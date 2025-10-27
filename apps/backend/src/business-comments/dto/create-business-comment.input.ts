import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID, IsInt, Min, Max } from 'class-validator';
import { ICreateBusinessComment } from '@motorove/shared';

@InputType()
export class CreateBusinessCommentInput implements ICreateBusinessComment {
  @Field()
  @IsNotEmpty()
  @IsString()
  content: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  businessId: string;
}
