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
        where: { id: input.id },
      });

      if (!existingSetting) {
        throw new NotFoundException(
          `User setting with ID ${input.id} not found`,
        );
      }

      const updateData: any = { updatedById: userId, updatedAt: new Date() };
      if (input.autoAcceptFollowers !== null)
        updateData.autoAcceptFollowers = input.autoAcceptFollowers;
      if (input.notificationPermission !== null)
        updateData.notificationPermission = input.notificationPermission;
      if (input.notificationPreferences !== null)
        updateData.notificationPreferences = input.notificationPreferences;

      const userSetting = await this.prisma.userSetting.update({
        where: { id: input.id },
        data: updateData,
      });

      return plainToClass(UserSettingDto, userSetting);
    } catch (error) {
      this.logger.error(`Failed to update user setting ${input.id}:`, error);
      throw error;
    }
  }
}
