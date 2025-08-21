import Filter from 'leo-profanity';
import {turkishProfanityWords} from '../utils/turkish-profanity';

/**
 * Service for filtering profanity in text content
 */
class ProfanityFilterService {
  private initialized = false;

  /**
   * Initialize the profanity filter with default dictionary
   */
  constructor() {
    this.initialize();
  }

  /**
   * Initialize the filter with default dictionary
   * @private
   */
  private initialize(): void {
    // Initialize with the default English dictionary
    Filter.loadDictionary();

    // Add Turkish profanity words
    this.initializeTurkishDictionary();

    this.initialized = true;
  }

  /**
   * Initialize Turkish dictionary
   */
  private initializeTurkishDictionary(): void {
    // Add Turkish profanity words to the filter
    Filter.add(turkishProfanityWords);
  }

  /**
   * Add custom words to the profanity list
   * @param words Array of words to add to the profanity list
   */
  addWords(words: string[]): void {
    Filter.add(words);
  }

  /**
   * Remove words from the profanity list
   * @param words Array of words to remove from the profanity list
   */
  removeWords(words: string[]): void {
    Filter.remove(words);
  }

  /**
   * Check if text contains profanity
   * @param text Text to check
   * @returns True if text contains profanity, false otherwise
   */
  containsProfanity(text: string): boolean {
    if (!text) {
      return false;
    }
    return Filter.check(text);
  }

  /**
   * Filter profanity from text
   * @param text Text to filter
   * @param replacement Optional replacement character (default: '*')
   * @returns Filtered text with profanity replaced
   */
  filterText(text: string, replacement = '*'): string {
    if (!text) {
      return '';
    }
    return Filter.clean(text, replacement);
  }

  /**
   * Get a list of profane words in the text
   * @param text Text to analyze
   * @returns Array of profane words found in the text
   */
  getProfaneWords(text: string): string[] {
    if (!text) {
      return [];
    }
    return Filter.list(text);
  }

  /**
   * Add custom Turkish words to the profanity list
   * @param words Array of Turkish words to add to the profanity list
   */
  addTurkishWords(words: string[]): void {
    // Convert words to lowercase for better matching
    const lowerCaseWords = words.map(word => word.toLowerCase());
    Filter.add(lowerCaseWords);
  }

  /**
   * Check if text contains Turkish profanity
   * This method is optimized for Turkish text
   * @param text Text to check
   * @returns True if text contains profanity, false otherwise
   */
  containsTurkishProfanity(text: string): boolean {
    if (!text) {
      return false;
    }
    // Convert to lowercase for better matching with Turkish characters
    const lowerCaseText = text.toLowerCase();
    return Filter.check(lowerCaseText);
  }
}

// Create a singleton instance
const profanityFilterService = new ProfanityFilterService();

export default profanityFilterService;
