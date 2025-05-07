import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../auth/supabase.service';
import { ConfigService } from '../config/config.service';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly bucketName: string;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get<string>(
      'SUPABASE_STORAGE_BUCKET',
      'images',
    );
  }

  /**
   * Upload a file to Supabase storage
   * @param file Base64 encoded file data
   * @param path Optional path within the bucket (e.g., 'groups', 'users')
   * @param fileOptions Optional file metadata like contentType
   * @returns The URL of the uploaded file
   */
  async uploadFile(
    file: string,
    path: string = '',
    fileOptions?: { contentType?: string; filename?: string },
  ): Promise<string> {
    const supabase = this.supabaseService.getClient();

    // Remove data URI prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = file.includes('base64,')
      ? file.split('base64,')[1]
      : file;

    // Generate a unique filename with extension
    const filename = fileOptions?.filename || `${randomUUID()}`;
    const fullPath = path ? `${path}/${filename}` : filename;

    // Upload the file
    const { error } = await supabase.storage
      .from(this.bucketName)
      .upload(fullPath, Buffer.from(base64Data, 'base64'), {
        contentType: fileOptions?.contentType || 'image/jpeg',
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(fullPath);

    return urlData.publicUrl;
  }

  /**
   * Delete a file from Supabase storage
   * @param path The full path to the file including the filename
   */
  async deleteFile(path: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get a signed URL for a file
   * @param path The full path to the file
   * @param expiresIn The number of seconds until the signed URL expires
   * @returns The signed URL
   */
  async getSignedUrl(path: string, expiresIn: number = 60): Promise<string> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }
}
