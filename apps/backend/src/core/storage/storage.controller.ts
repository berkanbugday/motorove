import { Controller, Post, Body, Headers } from '@nestjs/common';
import { StorageService } from './storage.service';
import { SupabaseService } from '../../auth/supabase.service';
import { ExceptionHelper } from '../exceptions';

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
      ExceptionHelper.unauthorized('errors.common.invalid_authentication');
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    const { data, error } = await this.supabaseService.getUser(token);

    if (error || !data.user) {
      ExceptionHelper.unauthorized('errors.common.invalid_token');
    }

    // Validate file data
    if (!fileData.file) {
      ExceptionHelper.badRequest('errors.common.failed_to_upload', {
        resource: 'file',
      });
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
      ExceptionHelper.badRequest('errors.common.failed_to_upload_with_error', {
        resource: 'file',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
