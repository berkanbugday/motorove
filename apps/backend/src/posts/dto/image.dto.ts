import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';

@ObjectType()
export class ImageDto {
  @Field(() => String)
  @IsString()
  url: string;

  @Field(() => Boolean)
  @IsBoolean()
  isCensored: boolean;
}
