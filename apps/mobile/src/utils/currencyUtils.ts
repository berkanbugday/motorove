/**
 * Currency formatting utilities for the mobile application
 * Based on NumberAnimatedInput component formatting logic
 */

export interface CurrencyFormatOptions {
  /** Number of decimal places to display (default: 2) */
  decimalPlaces?: number;
  /** Thousand separator character (default: '.') */
  thousandSeparator?: string;
  /** Decimal separator character (default: ',') */
  decimalSeparator?: string;
  /** Whether to allow negative values (default: false) */
  allowNegative?: boolean;
  /** Currency symbol to prepend (default: '₺') */
  currencySymbol?: string;
  /** Whether to show currency symbol (default: true) */
  showCurrencySymbol?: boolean;
  /** Position of currency symbol: 'before' | 'after' (default: 'before') */
  currencyPosition?: 'before' | 'after';
  /** Minimum value allowed */
  minValue?: number;
  /** Maximum value allowed */
  maxValue?: number;
}

const DEFAULT_OPTIONS: Required<CurrencyFormatOptions> = {
  decimalPlaces: 2,
  thousandSeparator: '.',
  decimalSeparator: ',',
  allowNegative: false,
  currencySymbol: '₺',
  showCurrencySymbol: true,
  currencyPosition: 'before',
  minValue: 0,
  maxValue: Number.MAX_SAFE_INTEGER,
};

/**
 * Formats a number as currency with thousand separators and decimal places
 * @param value - The numeric value to format (number or string)
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | string,
  options: CurrencyFormatOptions = {},
): string {
  const opts = {...DEFAULT_OPTIONS, ...options};

  if (value === null || value === undefined || value === '') {
    return opts.showCurrencySymbol ? opts.currencySymbol + ' 0' : '0';
  }

  // Convert to string for processing
  const stringValue = typeof value === 'number' ? value.toString() : value;

  // Format the number part
  const formattedNumber = formatNumber(stringValue, opts);

  // Add currency symbol if enabled
  if (opts.showCurrencySymbol) {
    return opts.currencyPosition === 'before'
      ? `${opts.currencySymbol} ${formattedNumber}`
      : `${formattedNumber} ${opts.currencySymbol}`;
  }

  return formattedNumber;
}

/**
 * Formats a number with thousand separators and decimal places (without currency symbol)
 * @param value - The numeric value to format
 * @param options - Formatting options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number | string,
  options: Omit<
    CurrencyFormatOptions,
    'currencySymbol' | 'showCurrencySymbol' | 'currencyPosition'
  > = {},
): string {
  const opts = {...DEFAULT_OPTIONS, ...options};

  if (value === null || value === undefined || value === '') {
    return '';
  }

  const stringValue = typeof value === 'number' ? value.toString() : value;

  // Remove all non-numeric characters except decimal separator and minus
  let cleanNum = stringValue.replace(
    new RegExp(
      `[^0-9${opts.decimalSeparator}${opts.allowNegative ? '-' : ''}]`,
      'g',
    ),
    '',
  );

  // Handle negative sign
  const isNegative = opts.allowNegative && cleanNum.startsWith('-');
  if (isNegative) {
    cleanNum = cleanNum.substring(1);
  }

  // Split by decimal separator
  const parts = cleanNum.split(opts.decimalSeparator);
  let integerPart = parts[0] || '';
  let decimalPart = parts[1] || '';

  // Limit decimal places
  if (decimalPart.length > opts.decimalPlaces) {
    decimalPart = decimalPart.substring(0, opts.decimalPlaces);
  }

  // Add thousand separators to integer part
  if (integerPart.length > 3) {
    integerPart = integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      opts.thousandSeparator,
    );
  }

  // Combine parts
  let formatted = integerPart;
  if (opts.decimalPlaces > 0 && (decimalPart || parts.length > 1)) {
    formatted += opts.decimalSeparator + decimalPart;
  }

  return isNegative ? '-' + formatted : formatted;
}

/**
 * Parses a formatted currency string back to a raw number string
 * @param formattedValue - The formatted currency string
 * @param options - Formatting options used for parsing
 * @returns Raw number string
 */
export function parseCurrency(
  formattedValue: string,
  options: CurrencyFormatOptions = {},
): string {
  const opts = {...DEFAULT_OPTIONS, ...options};
  if (!formattedValue) {
    return '';
  }

  let cleanValue = formattedValue;

  // Remove currency symbol if present
  if (opts.showCurrencySymbol && opts.currencySymbol) {
    cleanValue = cleanValue.replace(opts.currencySymbol, '').trim();
  }

  // Escape special regex characters in thousand separator and remove them
  const escapedThousandSeparator = opts.thousandSeparator.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  );

  return cleanValue.replace(new RegExp(escapedThousandSeparator, 'g'), '');
}

/**
 * Validates if a currency value is within the specified constraints
 * @param value - The value to validate (number or string)
 * @param options - Validation options
 * @returns True if valid, false otherwise
 */
export function validateCurrencyValue(
  value: number | string,
  options: CurrencyFormatOptions = {},
): boolean {
  const opts = {...DEFAULT_OPTIONS, ...options};

  if (value === null || value === undefined || value === '') {
    return true;
  }

  const stringValue = typeof value === 'number' ? value.toString() : value;
  const parsedValue = parseCurrency(stringValue, opts);
  const numValue = parseFloat(parsedValue);

  if (isNaN(numValue)) {
    return false;
  }

  if (numValue < opts.minValue) {
    return false;
  }

  if (opts.maxValue !== undefined && numValue > opts.maxValue) {
    return false;
  }

  return true;
}

/**
 * Converts a formatted currency string to a numeric value
 * @param formattedValue - The formatted currency string
 * @param options - Formatting options
 * @returns Numeric value or NaN if invalid
 */
export function currencyToNumber(
  formattedValue: string,
  options: CurrencyFormatOptions = {},
): number {
  const parsedValue = parseCurrency(formattedValue, options);
  return parseFloat(parsedValue) || 0;
}

/**
 * Formats a price with Turkish Lira currency (₺) using Turkish number formatting
 * @param value - The price value
 * @param decimalPlaces - Number of decimal places (default: 2)
 * @returns Formatted price string with ₺ symbol
 */
export function formatPrice(
  value: number | string,
  decimalPlaces: number = 2,
): string {
  return formatCurrency(value, {
    decimalPlaces,
    thousandSeparator: '.',
    decimalSeparator: ',',
    currencySymbol: '₺',
    showCurrencySymbol: true,
    currencyPosition: 'before',
    allowNegative: false,
  });
}

/**
 * Formats a number with Turkish number formatting (no currency symbol)
 * @param value - The numeric value
 * @param decimalPlaces - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatTurkishNumber(
  value: number | string,
  decimalPlaces: number = 2,
): string {
  return formatNumber(value, {
    decimalPlaces,
    thousandSeparator: '.',
    decimalSeparator: ',',
    allowNegative: false,
  });
}

/**
 * Formats a number with international formatting (comma as thousand separator, dot as decimal)
 * @param value - The numeric value
 * @param decimalPlaces - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatInternationalNumber(
  value: number | string,
  decimalPlaces: number = 2,
): string {
  return formatNumber(value, {
    decimalPlaces,
    thousandSeparator: ',',
    decimalSeparator: '.',
    allowNegative: false,
  });
}

/**
 * Formats a currency with international formatting and USD symbol
 * @param value - The price value
 * @param decimalPlaces - Number of decimal places (default: 2)
 * @returns Formatted price string with $ symbol
 */
export function formatUSDPrice(
  value: number | string,
  decimalPlaces: number = 2,
): string {
  return formatCurrency(value, {
    decimalPlaces,
    thousandSeparator: ',',
    decimalSeparator: '.',
    currencySymbol: '$',
    showCurrencySymbol: true,
    currencyPosition: 'before',
    allowNegative: false,
  });
}
