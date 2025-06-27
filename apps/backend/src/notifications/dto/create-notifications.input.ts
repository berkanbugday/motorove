import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationType } from '../../enums/models/notification-type.enum';

@InputType()
export class CreateNotificationsInput {
  @Field(() => [String])
  @IsArray()
  @IsNotEmpty()
  userIds: string[];

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

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  data?: string;
}
