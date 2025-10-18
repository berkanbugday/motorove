import { Injectable, Logger } from '@nestjs/common';
import { Language } from '../../enums/models/language.enum';
import { ConfigService } from '../../core/config/config.service';
import { translations } from './locales';

@Injectable()
export class I18nService {
  private readonly logger = new Logger(I18nService.name);
  private isInitialized = false;
  private i18next: any;

  constructor(private readonly configService: ConfigService) {
    void this.initializeI18n();
  }

  private async initializeI18n(): Promise<void> {
    try {
      // Use dynamic imports to handle CommonJS/ESM compatibility
      const i18nextModule = await import('i18next');

      // Handle both default and named exports
      this.i18next = i18nextModule.default || i18nextModule;

      // Validate that modules loaded correctly
      if (!this.i18next || !this.i18next.init) {
        throw new Error('Failed to load i18next module');
      }

      await this.i18next.init({
        lng: Language.TR.toLowerCase(), // Default language
        fallbackLng: Language.TR.toLowerCase(),
        debug: this.configService.isDevelopment(),
        resources: this.buildI18nResources(),
        interpolation: {
          escapeValue: false, // Not needed for server-side
        },
        saveMissing: false,
        updateMissing: false,
      });

      this.isInitialized = true;
      this.logger.log(
        'I18n service initialized successfully with TypeScript translations',
      );
    } catch (error) {
      this.logger.error('Failed to initialize I18n service', error);
      throw error;
    }
  }

  /**
   * Build i18next resources from TypeScript translation objects
   */
  private buildI18nResources(): Record<string, { translation: any }> {
    const resources: Record<string, { translation: any }> = {};

    for (const [language, translationData] of Object.entries(translations)) {
      resources[language] = {
        translation: translationData,
      };
    }

    return resources;
  }

  /**
   * Get translation function for a specific language
   */
  getTranslationFunction(
    language: Language,
  ): (key: string, options?: any) => string {
    if (!this.isInitialized || !this.i18next) {
      this.logger.warn('I18n service not initialized, using fallback');
      return (key: string) => key;
    }

    return this.i18next.getFixedT(language.toLowerCase());
  }

  /**
   * Translate a key with optional interpolation values
   */
  translate(
    key: string,
    language: Language = Language.TR,
    options?: Record<string, any>,
  ): string {
    try {
      const t = this.getTranslationFunction(language);
      return t(key, options);
    } catch (error) {
      this.logger.error(`Translation failed for key: ${key}`, error);
      return key; // Fallback to key if translation fails
    }
  }

  /**
   * Check if a translation key exists
   */
  exists(key: string, language: Language = Language.TR): boolean {
    try {
      if (!this.isInitialized || !this.i18next) {
        return false;
      }
      return this.i18next.exists(key, { lng: language.toLowerCase() });
    } catch (error) {
      this.logger.error(`Failed to check if key exists: ${key}`, error);
      return false;
    }
  }

  /**
   * Get all available languages
   */
  getAvailableLanguages(): string[] {
    return Object.values(Language).map((lang) => lang.toLowerCase());
  }

  /**
   * Change language dynamically
   */
  async changeLanguage(language: Language): Promise<void> {
    try {
      if (!this.isInitialized || !this.i18next) {
        throw new Error('I18n service not initialized');
      }
      await this.i18next.changeLanguage(language.toLowerCase());
      this.logger.log(`Language changed to: ${language}`);
    } catch (error) {
      this.logger.error(`Failed to change language to: ${language}`, error);
      throw error;
    }
  }
}
