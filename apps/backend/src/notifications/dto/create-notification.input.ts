import { Field, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationType } from '@motorove/shared';

@InputType()
export class CreateNotificationInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  body: string;

  @Field(() => NotificationType)
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsObject()
  data?: string;
}
