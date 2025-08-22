import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';
import * as nsfw from 'nsfwjs';
import { Tensor3D } from '@tensorflow/tfjs-node';

@Injectable()
export class NSFWService implements OnModuleInit {
  private readonly logger = new Logger(NSFWService.name);
  private nsfwModel: nsfw.NSFWJS;

  constructor() {}

  async onModuleInit(): Promise<void> {
    try {
      // Load the NSFW detection model
      this.nsfwModel = await nsfw.load();
      this.logger.log('NSFW detection model loaded successfully');
    } catch (error) {
      this.logger.error('Failed to load NSFW detection model', error);
    }
  }

  /**
   * Check if an image contains NSFW content
   * @param imageUrl URL of the image to check
   * @returns Object containing isCensored flag and predictions
   */
  async checkNSFWContent(imageUrl: string): Promise<{
    isCensored: boolean;
    predictions: Array<{ className: string; probability: number }> | null;
  }> {
    try {
      if (!this.nsfwModel) {
        this.logger.warn('NSFW model not loaded, skipping check');
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

      // Check if any NSFW categories exceed threshold
      // Categories: Porn, Sexy, Hentai, Drawing, Neutral
      const nsfwThreshold = 0.7; // 70% confidence threshold
      const nsfwCategories = ['Porn', 'Sexy', 'Hentai'];

      const isCensored = predictions.some(
        (p: { className: string; probability: number }) =>
          nsfwCategories.includes(p.className) && p.probability > nsfwThreshold,
      );

      return { isCensored, predictions };
    } catch (error) {
      this.logger.error(
        `Error checking NSFW content for image ${imageUrl}`,
        error instanceof Error ? error.message : String(error),
      );
      return { isCensored: false, predictions: null };
    }
  }
}
