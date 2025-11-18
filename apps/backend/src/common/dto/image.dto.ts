import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { IImage } from '@motorove/shared';

@ObjectType()
export class ImageDto implements IImage {
  @Field(() => String)
  @IsString()
  url: string;

  @Field(() => Boolean)
  @IsBoolean()
  isCensored: boolean;

  @Field(() => Int)
  @IsNumber()
  order: number;
}
