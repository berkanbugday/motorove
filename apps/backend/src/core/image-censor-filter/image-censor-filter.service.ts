import { Injectable, Logger } from '@nestjs/common';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { ConfigService } from '../config/config.service';

@Injectable()
export class ImageCensorFilterService {
  private readonly logger = new Logger(ImageCensorFilterService.name);
  private visionClient: ImageAnnotatorClient;

  constructor(private readonly configService: ConfigService) {
    // Initialize Google Cloud Vision client with API key
    const apiKey = this.configService.get<string>(
      'GOOGLE_CLOUD_VISION_API_KEY',
    );

    this.visionClient = new ImageAnnotatorClient({
      apiKey,
    });

    this.logger.log('Google Cloud Vision API client initialized successfully');
  }

  /**
   * Check if an image contains inappropriate content using Google Cloud Vision API
   * @param imageUrl URL of the image to check
   * @returns Object containing isCensored flag and predictions
   */
  async checkImageCensorContent(imageUrl: string): Promise<{
    isCensored: boolean;
    predictions: Array<{ className: string; probability: number }> | null;
  }> {
    try {
      // Validate URL
      if (!imageUrl || typeof imageUrl !== 'string') {
        this.logger.warn('Invalid image URL provided');
        return { isCensored: false, predictions: null };
      }

      // Perform safe search detection
      const [result] = await this.visionClient.safeSearchDetection(imageUrl);
      const safeSearch = result.safeSearchAnnotation;

      if (!safeSearch) {
        this.logger.warn('No safe search annotation returned from Vision API');
        return { isCensored: false, predictions: null };
      }

      // Map Google Cloud Vision likelihood to probability (0-1)
      const likelihoodToProbability = (likelihood: any): number => {
        const likelihoodStr = String(likelihood || '');
        switch (likelihoodStr) {
          case 'VERY_UNLIKELY':
            return 0.1;
          case 'UNLIKELY':
            return 0.3;
          case 'POSSIBLE':
            return 0.5;
          case 'LIKELY':
            return 0.7;
          case 'VERY_LIKELY':
            return 0.9;
          default:
            return 0.0;
        }
      };

      // Create predictions array
      const predictions = [
        {
          className: 'Adult',
          probability: likelihoodToProbability(safeSearch.adult),
        },
        {
          className: 'Racy',
          probability: likelihoodToProbability(safeSearch.racy),
        },
        {
          className: 'Violence',
          probability: likelihoodToProbability(safeSearch.violence),
        },
      ];

      // Check if content should be censored
      // LIKELY or VERY_LIKELY for adult or racy content
      const isCensored =
        safeSearch.adult === 'LIKELY' ||
        safeSearch.adult === 'VERY_LIKELY' ||
        safeSearch.racy === 'VERY_LIKELY';

      if (isCensored) {
        this.logger.warn(
          `Inappropriate content detected in image: ${imageUrl}`,
          {
            adult: safeSearch.adult,
            racy: safeSearch.racy,
            violence: safeSearch.violence,
          },
        );
      }

      return { isCensored, predictions };
    } catch (error) {
      this.logger.error(
        `Error checking image content with Google Cloud Vision API: ${imageUrl}`,
        {
          trace: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      );
      return { isCensored: false, predictions: null };
    }
  }
}
