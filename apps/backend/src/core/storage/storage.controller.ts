import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { SupabaseService } from '../../auth/supabase.service';

@Controller('storage')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post('upload')
  async uploadFile(
    @Headers('authorization') authHeader: string,
    @Body() fileData: { file: string; path?: string; contentType?: string },
  ) {
    // Validate auth token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authentication');
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    const { data, error } = await this.supabaseService.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Validate file data
    if (!fileData.file) {
      throw new BadRequestException('File data is required');
    }

    try {
      const url = await this.storageService.uploadFile(
        fileData.file,
        fileData.path || '',
        {
          contentType: fileData.contentType,
        },
      );

      return {
        success: true,
        url,
      };
    } catch (error) {
      throw new BadRequestException(
        `File upload failed: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
