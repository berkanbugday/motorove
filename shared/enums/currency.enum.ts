export enum Currency {
  TL = "TL",
  USD = "USD",
  EUR = "EUR",
}

export const CURRENCY_SYMBOLS = {
  [Currency.TL]: "₺",
  [Currency.USD]: "$",
  [Currency.EUR]: "€",
} as const;

export const CURRENCY_FORMATTING = {
  [Currency.TL]: {
    decimalPlaces: 2,
    thousandSeparator: ".",
    decimalSeparator: ",",
  },
  [Currency.USD]: {
    decimalPlaces: 2,
    thousandSeparator: ",",
    decimalSeparator: ".",
  },
  [Currency.EUR]: {
    decimalPlaces: 2,
    thousandSeparator: ".",
    decimalSeparator: ",",
  },
} as const;

export const DEFAULT_CURRENCY = Currency.TL;
