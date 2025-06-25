import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';

@InputType()
export class GroupFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  city?: string;

  @Field(() => String, { nullable: true, defaultValue: 'ALL' })
  @IsOptional()
  @IsEnum(['PUBLIC', 'PRIVATE', 'ALL'])
  privacy?: 'PUBLIC' | 'PRIVATE' | 'ALL' = 'ALL';

  @Field(() => [String], { defaultValue: [] })
  @IsOptional()
  tags: string[] = [];

  @Field(() => String, { nullable: true, defaultValue: 'ALL' })
  @IsOptional()
  @IsEnum(['ADMIN', 'MEMBER', 'ALL'])
  role?: 'ADMIN' | 'MEMBER' | 'ALL';
}
