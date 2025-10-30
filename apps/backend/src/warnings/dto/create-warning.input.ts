import { InputType, Field } from '@nestjs/graphql';
import { ValidateNested, IsEnum, IsOptional } from 'class-validator';
import { WarningType } from '../../enums/models/warning-type.enum';
import { ICreateWarning } from '@motorove/shared';
import { BaseCreateAddressInput } from '../../common/dto/base-create-address.input';
import { BaseCreateDescriptionInput } from '../../common/dto/base-create-description.input';
import { Type } from 'class-transformer';

@InputType()
export class CreateWarningInput implements ICreateWarning {
  @Field(() => WarningType)
  @IsEnum(WarningType)
  type: WarningType;

  @Field(() => [BaseCreateAddressInput])
  @ValidateNested({ each: true })
  @Type(() => BaseCreateAddressInput)
  addresses: BaseCreateAddressInput[];

  @Field(() => [BaseCreateDescriptionInput], { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => BaseCreateDescriptionInput)
  @IsOptional()
  descriptions?: BaseCreateDescriptionInput[];
}
