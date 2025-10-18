import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { Language } from '../enums/language.enum';

/**
 * Format date values in notification data according to preferred language
 */
export function formatDatesInData(
  data: Record<string, any> | null,
  preferredLanguage?: Language,
): Record<string, any> | null {
  if (!data) return null;

  const formattedData = { ...data };
  const locale = preferredLanguage === Language.TR ? tr : enUS;

  // Check each property in data for date values
  Object.keys(formattedData).forEach((key) => {
    const value: any = formattedData[key];

    // Check if the value is a date string or Date object
    if (isDateValue(value)) {
      try {
        const date = new Date(value as string | Date);
        if (!isNaN(date.getTime())) {
          // Format according to preferred language
          formattedData[key] = format(date, 'PPPP • HH:mm', { locale });
        }
      } catch (error) {
        // If date parsing fails, keep original value
        console.warn(`Failed to format date value: ${value}`, error);
      }
    }
  });

  return formattedData;
}

/**
 * Check if a value is likely a date
 */
export function isDateValue(value: any): boolean {
  if (!value) return false;

  // Check if it's a Date object
  if (value instanceof Date) return true;

  // Check if it's a string that looks like a date
  if (typeof value === 'string') {
    // Check for ISO date format or other common date formats
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    return dateRegex.test(value) || !isNaN(Date.parse(value));
  }

  return false;
}
