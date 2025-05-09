/**
 * Converts a string to PascalCase, replacing underscores and spaces
 * @param text The string to convert
 * @returns The string in PascalCase
 */
export const toPascalCase = (text: string): string => {
  if (!text) {return '';}

  // Replace underscores and spaces with spaces to normalize
  const normalized = text.replace(/[_\s]+/g, ' ');

  // Convert to PascalCase
  return normalized
    .split(' ')
    .map(word => {
      if (!word) {return '';}
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
};
