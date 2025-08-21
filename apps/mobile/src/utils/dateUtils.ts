import {TFunction} from 'i18next';

/**
 * Format a date for display in the UI
 * @param date - The date to format
 * @returns A formatted date string like "Mon, Apr 15, 2024 • 6:30 PM"
 */
export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  const dateStr = date.toLocaleDateString('en-US', options);
  const timeStr = date.toLocaleTimeString('en-US', timeOptions);

  return `${dateStr} • ${timeStr}`;
}

/**
 * Get a relative time string (e.g., "in 2 days" or "3 hours ago")
 * @param date - The date to get relative time for
 * @returns A relative time string
 */
export function relativeTime(timestamp: Date | string, t: TFunction): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMs > 0) {
    // Past
    if (Math.abs(diffDays) >= 1) {
      return t('common.days_ago', {
        count: Math.abs(diffDays),
        day: Math.abs(diffDays) === 1 ? t('common.day') : t('common.days'),
      });
    } else if (Math.abs(diffHours) >= 1) {
      return t('common.hours_ago', {
        count: Math.abs(diffHours),
        hour: Math.abs(diffHours) === 1 ? t('common.hour') : t('common.hours'),
      });
    } else if (Math.abs(diffMinutes) >= 1) {
      return t('common.minutes_ago', {
        count: Math.abs(diffMinutes),
        minute:
          Math.abs(diffMinutes) === 1
            ? t('common.minute')
            : t('common.minutes'),
      });
    } else {
      return t('common.now');
    }
  } else {
    // Future
    if (diffDays >= 1) {
      return t('common.days_in', {
        count: diffDays,
        day: diffDays === 1 ? t('common.day') : t('common.days'),
      });
    } else if (diffHours >= 1) {
      return t('common.hours_in', {
        count: diffHours,
        hour: diffHours === 1 ? t('common.hour') : t('common.hours'),
      });
    } else if (diffMinutes >= 1) {
      return t('common.minutes_in', {
        count: diffMinutes,
        minute: diffMinutes === 1 ? t('common.minute') : t('common.minutes'),
      });
    } else {
      return t('common.now');
    }
  }
}

/**
 * Format a date range for display in the UI
 * @param startDate - The start date of the range
 * @param endDate - The end date of the range
 * @returns A formatted date range string like "Apr 15 - Apr 17, 2024"
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const startOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };

  const endOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  // If both dates are in the same month and year
  if (
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    return `${startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} - ${endDate.toLocaleDateString('en-US', {
      day: 'numeric',
      year: 'numeric',
    })}`;
  }

  return `${startDate.toLocaleDateString(
    'en-US',
    startOptions,
  )} - ${endDate.toLocaleDateString('en-US', endOptions)}`;
}
