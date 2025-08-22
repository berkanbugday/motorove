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

      // Load the image
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      const image = tf.node.decodeImage(new Uint8Array(buffer), 3) as Tensor3D;

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
        error instanceof Error ? error.message : String(error),
      );
      return { isCensored: false, predictions: null };
    }
  }
}
