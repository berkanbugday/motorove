declare module 'leo-profanity' {
  interface Filter {
    /**
     * Load dictionary
     * @param name Optional dictionary name
     */
    loadDictionary(name?: string): void;

    /**
     * Add words to the profanity list
     * @param words Array of words to add
     */
    add(words: string[]): void;

    /**
     * Remove words from the profanity list
     * @param words Array of words to remove
     */
    remove(words: string[]): void;

    /**
     * Check if text contains profanity
     * @param text Text to check
     * @returns True if text contains profanity, false otherwise
     */
    check(text: string): boolean;

    /**
     * Filter profanity from text
     * @param text Text to filter
     * @param replacement Optional replacement character (default: '*')
     * @returns Filtered text with profanity replaced
     */
    clean(text: string, replacement?: string): string;

    /**
     * Get a list of profane words in the text
     * @param text Text to analyze
     * @returns Array of profane words found in the text
     */
    list(text: string): string[];

    /**
     * Reset the dictionary
     */
    reset(): void;

    /**
     * Get all words in the current dictionary
     * @returns Array of all profane words in the dictionary
     */
    getDictionary(): string[];
  }

  const filter: Filter;
  export default filter;
}
