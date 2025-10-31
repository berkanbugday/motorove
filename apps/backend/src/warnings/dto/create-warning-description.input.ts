import { Field, InputType } from '@nestjs/graphql';
import { ICreateWarningDescription, Language } from '@motorove/shared';
import { IsEnum, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateWarningDescriptionInput
  implements ICreateWarningDescription
{
  @Field(() => String)
  @IsString()
  description: string;

  @Field(() => Language, { nullable: true })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;
}
