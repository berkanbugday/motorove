import { Injectable, Logger } from '@nestjs/common';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserSettingDto } from './dto/user-setting.dto';
import { UpdateUserSettingInput } from './dto/update-user-setting.input';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UserSettingsService {
  private readonly logger = new Logger(UserSettingsService.name);

  constructor(private prisma: PrismaService) {}

  async findOne(userId: string): Promise<UserSettingDto> {
    try {
      const userSetting = await this.prisma.userSetting.findFirst({
        where: { userId },
      });

      if (!userSetting) {
        ExceptionHelper.notFound('errors.common.not_found', {
          resource: 'user_setting',
        });
      }

      return plainToClass(UserSettingDto, userSetting);
    } catch (error) {
      this.logger.error(`Failed to fetch user setting ${userId}:`, error);
      throw error;
    }
  }
  async update(
    input: UpdateUserSettingInput,
    userId: string,
  ): Promise<UserSettingDto> {
    try {
      const existingSetting = await this.prisma.userSetting.findFirst({
        where: { userId },
      });

      if (!existingSetting) {
        ExceptionHelper.notFound('errors.common.not_found', {
          resource: 'user_setting',
        });
      }

      const userSetting = await this.prisma.userSetting.update({
        where: { userId },
        data: {
          ...input,
          updatedAt: new Date(),
        },
      });

      return plainToClass(UserSettingDto, userSetting);
    } catch (error) {
      this.logger.error(`Failed to update user setting ${userId}:`, error);
      throw error;
    }
  }
}
