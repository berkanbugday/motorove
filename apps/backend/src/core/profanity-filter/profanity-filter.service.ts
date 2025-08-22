import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Filter from 'leo-profanity';
import { turkishProfanityWords } from './utils/turkish-profanity';

/**
 * Service for filtering profanity in text content
 */
@Injectable()
export class ProfanityFilterService implements OnModuleInit {
  private readonly logger = new Logger(ProfanityFilterService.name);
  private initialized = false;

  /**
   * Initialize the profanity filter when the module is initialized
   */
  onModuleInit() {
    this.initialize();
    this.logger.log('ProfanityFilterService initialized');
  }

  /**
   * Initialize the filter with default dictionary
   * @private
   */
  private initialize(): void {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize with the default English dictionary
      Filter.loadDictionary('en');

      // Add Turkish profanity words
      this.initializeTurkishDictionary();

      this.initialized = true;
      this.logger.log('Profanity filter dictionaries loaded successfully');
    } catch (error: any) {
      this.logger.error(
        `Failed to initialize profanity filter: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Initialize Turkish dictionary
   */
  private initializeTurkishDictionary(): void {
    try {
      // Add Turkish profanity words to the filter
      Filter.add(turkishProfanityWords);
      this.logger.debug('Turkish profanity dictionary loaded');
    } catch (error: any) {
      this.logger.error(`Failed to load Turkish dictionary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add custom words to the profanity list
   * @param words Array of words to add to the profanity list
   */
  addWords(words: string[]): void {
    if (!this.initialized) {
      this.initialize();
    }

    try {
      Filter.add(words);
      this.logger.debug(
        `Added ${words.length} custom words to profanity filter`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to add custom words: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove words from the profanity list
   * @param words Array of words to remove from the profanity list
   */
  removeWords(words: string[]): void {
    if (!this.initialized) {
      this.initialize();
    }

    try {
      Filter.remove(words);
      this.logger.debug(`Removed ${words.length} words from profanity filter`);
    } catch (error: any) {
      this.logger.error(`Failed to remove words: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if text contains profanity
   * @param text Text to check
   * @returns True if text contains profanity, false otherwise
   */
  containsProfanity(text: string): boolean {
    if (!this.initialized) {
      this.initialize();
    }

    if (!text) {
      return false;
    }

    try {
      return Filter.check(text);
    } catch (error: any) {
      this.logger.error(`Error checking profanity: ${error.message}`);
      return false;
    }
  }

  /**
   * Filter profanity from text
   * @param text Text to filter
   * @param replacement Optional replacement character (default: '*')
   * @returns Filtered text with profanity replaced
   */
  filterText(text: string, replacement = '*'): string {
    if (!this.initialized) {
      this.initialize();
    }

    if (!text) {
      return '';
    }

    try {
      return Filter.clean(text, replacement);
    } catch (error: any) {
      this.logger.error(`Error filtering text: ${error.message}`);
      return text;
    }
  }

  /**
   * Get a list of profane words in the text
   * @param text Text to analyze
   * @returns Array of profane words found in the text
   */
  getProfaneWords(text: string): string[] {
    if (!this.initialized) {
      this.initialize();
    }

    if (!text) {
      return [];
    }

    try {
      // Get all profane words from the dictionary and filter those found in the text
      const allBadWords = Filter.list();
      return allBadWords.filter((word) =>
        text.toLowerCase().includes(word.toLowerCase()),
      );
    } catch (error: any) {
      this.logger.error(`Error listing profane words: ${error.message}`);
      return [];
    }
  }

  /**
   * Add custom Turkish words to the profanity list
   * @param words Array of Turkish words to add to the profanity list
   */
  addTurkishWords(words: string[]): void {
    if (!this.initialized) {
      this.initialize();
    }

    try {
      // Convert words to lowercase for better matching
      const lowerCaseWords = words.map((word) => word.toLowerCase());
      Filter.add(lowerCaseWords);
      this.logger.debug(
        `Added ${words.length} Turkish words to profanity filter`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to add Turkish words: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if text contains Turkish profanity
   * This method is optimized for Turkish text
   * @param text Text to check
   * @returns True if text contains profanity, false otherwise
   */
  containsTurkishProfanity(text: string): boolean {
    if (!this.initialized) {
      this.initialize();
    }

    if (!text) {
      return false;
    }

    try {
      // Convert to lowercase for better matching with Turkish characters
      const lowerCaseText = text.toLowerCase();
      return Filter.check(lowerCaseText);
    } catch (error: any) {
      this.logger.error(`Error checking Turkish profanity: ${error.message}`);
      return false;
    }
  }
}
