import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../../auth/supabase.service';
import { ConfigService } from '../config/config.service';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly bucketName: string;
  private readonly supabaseUrl: string;
  private readonly supabaseKey: string;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL', '');
    this.supabaseKey = this.configService.get<string>('SUPABASE_KEY', '');
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
   * @param authToken Optional JWT token for authenticated uploads
   * @returns The URL of the uploaded file
   */
  async uploadFile(
    file: string,
    path: string = '',
    fileOptions?: { contentType?: string; filename?: string },
    authToken?: string,
  ): Promise<string> {
    // Get default supabase client
    let supabase = this.supabaseService.getClient();

    // If auth token is provided, create a new client with the token
    if (authToken) {
      // Create a new Supabase client with the auth token
      supabase = createClient(this.supabaseUrl, this.supabaseKey, {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      });
    }

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
        cacheControl: '3600',
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    return fullPath;
  }

  /**
   * Delete a file from Supabase storage
   * @param path The full path to the file including the filename
   * @param authToken Optional JWT token for authenticated operations
   */
  async deleteFile(path: string, authToken?: string): Promise<void> {
    // Get default supabase client
    let supabase = this.supabaseService.getClient();

    // If auth token is provided, create a new client with the token
    if (authToken) {
      // Create a new Supabase client with the auth token
      supabase = createClient(this.supabaseUrl, this.supabaseKey, {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      });
    }

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
   * @param authToken Optional JWT token for authenticated operations
   * @returns The signed URL
   */
  async getSignedUrl(
    path: string,
    expiresIn: number = 3600,
    authToken?: string,
  ): Promise<string> {
    // Get default supabase client
    let supabase = this.supabaseService.getClient();

    // If auth token is provided, create a new client with the token
    if (authToken) {
      // Create a new Supabase client with the auth token
      supabase = createClient(this.supabaseUrl, this.supabaseKey, {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      });
    }

    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  // Process base64 image and upload to Supabase storage
  async processImageUpload(
    base64Image: string | null | undefined,
    path: string,
    filePrefix: string,
    authToken?: string,
  ): Promise<string | undefined> {
    if (!base64Image) return undefined;

    try {
      // Check if it's a URL or base64 data
      if (base64Image.startsWith('http')) {
        return base64Image; // Already a URL, just return it
      }

      // Extract content type
      const contentType = this.getContentTypeFromBase64(base64Image);
      const filename = `${filePrefix}-${Date.now()}`;

      // Upload to Supabase storage
      const imageUrl = await this.uploadFile(
        base64Image,
        path,
        {
          contentType,
          filename,
        },
        authToken,
      );

      return imageUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to upload image: ${errorMessage}`);
    }
  }

  // Extract content type from base64 data
  private getContentTypeFromBase64(base64Data: string): string {
    if (base64Data.includes('data:')) {
      const matches = base64Data.match(
        /data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/,
      );
      if (matches && matches.length > 1) {
        return matches[1];
      }
    }
    return 'image/jpeg'; // Default
  }
}
