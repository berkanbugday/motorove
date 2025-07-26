import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
      const userSetting = await this.prisma.userSetting.findUnique({
        where: { userId },
      });

      if (!userSetting) {
        throw new NotFoundException(`User setting with ID ${userId} not found`);
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
      const existingSetting = await this.prisma.userSetting.findUnique({
        where: { userId },
      });

      if (!existingSetting) {
        throw new NotFoundException(`User setting with ID ${userId} not found`);
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
