import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class SearchUsersInput {
  @Field()
  @IsString()
  query: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0)
  skip?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1)
  limit?: number;
}
