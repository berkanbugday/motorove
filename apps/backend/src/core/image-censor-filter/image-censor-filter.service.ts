import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';
import * as nsfw from 'nsfwjs';
import { Tensor3D } from '@tensorflow/tfjs-node';

@Injectable()
export class ImageCensorFilterService implements OnModuleInit {
  private readonly logger = new Logger(ImageCensorFilterService.name);
  private nsfwModel: nsfw.NSFWJS;

  constructor() {}

  async onModuleInit(): Promise<void> {
    try {
      // Load the image censor model
      this.nsfwModel = await nsfw.load();
      this.logger.log('Image censor model loaded successfully');
    } catch (error) {
      this.logger.error('Failed to load image censor model', error);
    }
  }

  /**
   * Check if an image contains image censor content
   * @param imageUrl URL of the image to check
   * @returns Object containing isCensored flag and predictions
   */
  async checkImageCensorContent(imageUrl: string): Promise<{
    isCensored: boolean;
    predictions: Array<{ className: string; probability: number }> | null;
  }> {
    try {
      if (!this.nsfwModel) {
        this.logger.warn('Image censor model not loaded, skipping check');
        return { isCensored: false, predictions: null };
      }

      // Validate URL
      if (!imageUrl || typeof imageUrl !== 'string') {
        this.logger.warn('Invalid image URL provided');
        return { isCensored: false, predictions: null };
      }

      // Load the image with proper error handling
      const response = await fetch(imageUrl, {
        headers: {
          Accept: 'image/*',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        this.logger.warn(
          `Failed to fetch image: ${response.status} ${response.statusText}`,
        );
        return { isCensored: false, predictions: null };
      }

      // Check Content-Type header
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.startsWith('image/')) {
        this.logger.warn(`Invalid content type for image: ${contentType}`);
        return { isCensored: false, predictions: null };
      }

      const buffer = await response.arrayBuffer();

      // Validate buffer size
      if (!buffer || buffer.byteLength === 0) {
        this.logger.warn('Empty image buffer received');
        return { isCensored: false, predictions: null };
      }

      // Validate image format by checking magic bytes
      const uint8Array = new Uint8Array(buffer);
      const isValidImage = this.validateImageFormat(uint8Array);

      if (!isValidImage) {
        this.logger.warn('Invalid image format detected');
        return { isCensored: false, predictions: null };
      }

      const image = tf.node.decodeImage(uint8Array, 3) as Tensor3D;

      // Run the prediction
      const predictions = await this.nsfwModel.classify(image);

      // Dispose the tensor to free memory
      image.dispose();

      // Check if any image censor categories exceed threshold
      // Categories: Porn, Sexy, Hentai, Drawing, Neutral
      const imageCensorThreshold = 0.7; // 70% confidence threshold
      const imageCensorCategories = ['Porn', 'Sexy', 'Hentai'];

      const isCensored = predictions.some(
        (p: { className: string; probability: number }) =>
          imageCensorCategories.includes(p.className) &&
          p.probability > imageCensorThreshold,
      );

      return { isCensored, predictions };
    } catch (error) {
      this.logger.error(
        `Error checking image censor content for image ${imageUrl}`,
        {
          trace: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      );
      return { isCensored: false, predictions: null };
    }
  }

  /**
   * Validate image format by checking magic bytes
   * @param buffer Image buffer
   * @returns True if valid image format detected
   */
  private validateImageFormat(buffer: Uint8Array): boolean {
    if (buffer.length < 4) {
      return false;
    }

    // Check for common image format magic bytes
    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return true;
    }

    // PNG: 89 50 4E 47
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return true;
    }

    // GIF: 47 49 46 38 (GIF8)
    if (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    ) {
      return true;
    }

    // BMP: 42 4D (BM)
    if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
      return true;
    }

    // WebP: RIFF...WEBP (check for RIFF header)
    if (
      buffer.length >= 12 &&
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return true;
    }

    return false;
  }
}
