import { Field, InputType } from '@nestjs/graphql';
import { IBaseCreateDescription } from '@motorove/shared';
import { Language } from '../../enums/models/language.enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class BaseCreateDescriptionInput implements IBaseCreateDescription {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field(() => Language, { nullable: true })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;
}
