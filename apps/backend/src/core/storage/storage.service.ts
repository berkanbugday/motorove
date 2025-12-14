import { Injectable, Logger } from '@nestjs/common';
import { ExceptionHelper } from '../exceptions/exception-helper.service';
import { SupabaseService } from '../../auth/supabase.service';
import { ConfigService } from '../config/config.service';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import * as sharp from 'sharp';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucketName: string;
  private readonly supabaseUrl: string;
  private readonly supabaseKey: string;

  // Image compression settings
  private readonly MAX_IMAGE_WIDTH = 1280;
  private readonly MAX_IMAGE_HEIGHT = 1280;
  private readonly JPEG_QUALITY = 70;
  private readonly MAX_FILE_SIZE_KB = 500; // Target max file size in KB

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
   * Compress an image buffer using sharp with progressive quality reduction
   * @param buffer The image buffer to compress
   * @param contentType The content type of the image
   * @returns Compressed image buffer and potentially updated content type
   */
  private async compressImage(
    buffer: Buffer,
    contentType: string,
  ): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      // Always resize first to max dimensions
      const processedBuffer = await sharp(buffer)
        .resize(this.MAX_IMAGE_WIDTH, this.MAX_IMAGE_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toBuffer();

      // Convert to JPEG for best compression (except for PNG with transparency)
      const outputContentType = 'image/jpeg';

      // Progressive quality reduction to meet target file size
      let quality = this.JPEG_QUALITY;
      let compressedBuffer = await sharp(processedBuffer)
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();

      // If still too large, progressively reduce quality
      while (
        compressedBuffer.length > this.MAX_FILE_SIZE_KB * 1024 &&
        quality > 30
      ) {
        quality -= 10;
        compressedBuffer = await sharp(processedBuffer)
          .jpeg({ quality, mozjpeg: true })
          .toBuffer();
      }

      // If still too large after quality reduction, resize further
      if (compressedBuffer.length > this.MAX_FILE_SIZE_KB * 1024) {
        const metadata = await sharp(processedBuffer).metadata();
        const scaleFactor = Math.sqrt(
          (this.MAX_FILE_SIZE_KB * 1024) / compressedBuffer.length,
        );
        const newWidth = Math.floor((metadata.width || 1280) * scaleFactor);
        const newHeight = Math.floor((metadata.height || 1280) * scaleFactor);

        compressedBuffer = await sharp(processedBuffer)
          .resize(newWidth, newHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 60, mozjpeg: true })
          .toBuffer();
      }

      return { buffer: compressedBuffer, contentType: outputContentType };
    } catch (error) {
      this.logger.warn(
        `Image compression failed, using original: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Return original buffer if compression fails
      return { buffer, contentType };
    }
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

    // Convert base64 to buffer
    let fileBuffer: Uint8Array = Buffer.from(base64Data, 'base64');
    let contentType = fileOptions?.contentType || 'image/jpeg';

    // Compress image if it's an image type
    if (contentType.startsWith('image/')) {
      const compressed = await this.compressImage(
        Buffer.from(fileBuffer),
        contentType,
      );
      fileBuffer = new Uint8Array(compressed.buffer);
      contentType = compressed.contentType;
    }

    // Upload the file
    const { error } = await supabase.storage
      .from(this.bucketName)
      .upload(fullPath, fileBuffer, {
        contentType,
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
      ExceptionHelper.badRequest('errors.common.failed_to_upload_with_error', {
        resource: 'image',
        error: errorMessage,
      });
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
