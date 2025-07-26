import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { UserSettingsService } from './user-settings.service';
import { UserSettingDto } from './dto/user-setting.dto';
import { UpdateUserSettingInput } from './dto/update-user-setting.input';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';

@Resolver(() => UserSettingDto)
export class UserSettingsResolver {
  constructor(private userSettingsService: UserSettingsService) {}

  @UseGuards(JwtGuard)
  @Query(() => UserSettingDto, { name: 'userSetting' })
  async findOneUserSetting(@CurrentUser() user: User): Promise<UserSettingDto> {
    return await this.userSettingsService.findOne(user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => UserSettingDto)
  async updateUserSetting(
    @Args('input') input: UpdateUserSettingInput,
    @CurrentUser() user: User,
  ): Promise<UserSettingDto> {
    return await this.userSettingsService.update(input, user.id);
  }
}
