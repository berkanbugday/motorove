import { Language } from "../enums/language.enum";

/**
 * Translate enum types in notification data
 * Converts enum values (e.g., "ACCIDENT") to translation keys (e.g., "enums.emergencyType.accident")
 * Handles both raw enum values and existing translation keys
 */
export function translateEnumsInData(
  data: Record<string, any> | null
): Record<string, any> | null {
  if (!data) return null;

  const translatedData = { ...data };
  const enumFields = ["emergencyType", "warningType"];

  enumFields.forEach((field) => {
    if (translatedData[field] && typeof translatedData[field] === "string") {
      const value = translatedData[field];

      // Check if it's already a translation key (starts with "enums.")
      if (!value.startsWith("enums.")) {
        // It's an enum value, construct the translation key
        const enumValue = value.toLowerCase();
        translatedData[field] = `enums.${field}.${enumValue}`;
      }
    }
  });

  return translatedData;
}

/**
 * Select language-specific address from an array of addresses
 * Returns the address matching the preferred language, or falls back to the first available
 */
function selectLanguageSpecificAddress(
  addresses:
    | Array<{ address: string; language: Language | string }>
    | null
    | undefined,
  preferredLanguage: Language
): string | null {
  if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
    return null;
  }

  // Normalize preferred language for comparison
  const normalizedPreferredLanguage = preferredLanguage.toUpperCase();

  // Find address matching preferred language
  const matchingAddress = addresses.find((addr) => {
    if (!addr || !addr.language) return false;
    const addrLanguage =
      typeof addr.language === "string"
        ? addr.language.toUpperCase()
        : addr.language;
    return addrLanguage === normalizedPreferredLanguage;
  });

  if (matchingAddress && matchingAddress.address) {
    return matchingAddress.address;
  }

  // Fallback to first available address that has an address value
  const firstValidAddress = addresses.find((addr) => addr && addr.address);
  return firstValidAddress?.address || null;
}

/**
 * Select language-specific description from an array of descriptions
 * Returns the description matching the preferred language, or falls back to the first available
 */
function selectLanguageSpecificDescription(
  descriptions:
    | Array<{ description: string; language: Language | string }>
    | null
    | undefined,
  preferredLanguage: Language
): string | null {
  if (
    !descriptions ||
    !Array.isArray(descriptions) ||
    descriptions.length === 0
  ) {
    return null;
  }

  // Normalize preferred language for comparison
  const normalizedPreferredLanguage = preferredLanguage.toUpperCase();

  // Find description matching preferred language
  const matchingDescription = descriptions.find((desc) => {
    if (!desc || !desc.language) return false;
    const descLanguage =
      typeof desc.language === "string"
        ? desc.language.toUpperCase()
        : desc.language;
    return descLanguage === normalizedPreferredLanguage;
  });

  if (matchingDescription && matchingDescription.description) {
    return matchingDescription.description;
  }

  // Fallback to first available description that has a description value
  const firstValidDescription = descriptions.find(
    (desc) => desc && desc.description
  );
  return firstValidDescription?.description || null;
}

/**
 * Select language-specific fields (address and description) from notification data
 * Replaces arrays with the selected language-specific values
 */
export function selectLanguageSpecificFields(
  data: Record<string, any> | null,
  preferredLanguage: Language
): Record<string, any> | null {
  if (!data) return null;

  const processedData = { ...data };

  // Handle addresses array
  if (processedData.addresses && Array.isArray(processedData.addresses)) {
    const selectedAddress = selectLanguageSpecificAddress(
      processedData.addresses,
      preferredLanguage
    );
    // If address exists, prefix it with a newline so it appears on a new line
    if (selectedAddress) {
      processedData.address = `\n${selectedAddress}`;
    }
    // Remove the addresses array as we've extracted the language-specific address
    delete processedData.addresses;
  }

  // Handle descriptions array
  if (processedData.descriptions && Array.isArray(processedData.descriptions)) {
    if (processedData.descriptions.length === 0) {
      // If descriptions array is empty, set description to empty string
      processedData.description = "";
      delete processedData.descriptions;
    } else {
      const selectedDescription = selectLanguageSpecificDescription(
        processedData.descriptions,
        preferredLanguage
      );
      // Always set description, even if selectedDescription is null (set to empty string)
      // If description exists, prefix it with a newline so it appears on a new line
      processedData.description = selectedDescription
        ? `\n${selectedDescription}`
        : "";
      // Remove the descriptions array as we've extracted the language-specific description
      delete processedData.descriptions;
    }
  }

  return processedData;
}

/**
 * Format notification data by translating enums and selecting language-specific fields
 * This combines both operations for convenience
 */
export function formatNotificationData(
  data: Record<string, any> | null,
  preferredLanguage: Language
): Record<string, any> | null {
  if (!data) return null;

  // First translate enums
  const withTranslatedEnums = translateEnumsInData(data);

  // Then select language-specific fields
  return selectLanguageSpecificFields(withTranslatedEnums, preferredLanguage);
}
