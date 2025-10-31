import { InputType, Field } from '@nestjs/graphql';
import { ValidateNested, IsEnum, IsOptional } from 'class-validator';
import { WarningType } from '../../enums/models/warning-type.enum';
import { ICreateWarning } from '@motorove/shared';
import { Type } from 'class-transformer';
import { CreateWarningAddressInput } from './create-warning-address.input';
import { CreateWarningDescriptionInput } from './create-warning-description.input';

@InputType()
export class CreateWarningInput implements ICreateWarning {
  @Field(() => WarningType)
  @IsEnum(WarningType)
  type: WarningType;

  @Field(() => [CreateWarningAddressInput])
  @ValidateNested({ each: true })
  @Type(() => CreateWarningAddressInput)
  addresses: CreateWarningAddressInput[];

  @Field(() => [CreateWarningDescriptionInput], { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => CreateWarningDescriptionInput)
  @IsOptional()
  descriptions?: CreateWarningDescriptionInput[];
}
