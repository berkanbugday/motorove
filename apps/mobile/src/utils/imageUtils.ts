/**
 * Utility functions for handling image URLs, particularly Supabase signed URLs
 */

/**
 * Extracts the storage path from a Supabase signed URL.
 * Supabase signed URLs format: https://[project].supabase.co/storage/v1/object/sign/[bucket]/[path]?token=...
 *
 * @param url - The URL to extract the path from
 * @param fallbackToUrl - If true, returns the original URL when extraction fails. If false, returns null.
 * @returns The extracted path, the original URL (if fallbackToUrl is true), or null
 */
export const extractPathFromSignedUrl = (
  url: string,
  fallbackToUrl: boolean = false,
): string | null => {
  if (!url || typeof url !== 'string') {
    return fallbackToUrl ? url : null;
  }

  // If not an HTTP URL, assume it's already a path
  if (!url.startsWith('http')) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(
      /\/storage\/v1\/object\/sign\/(.+)/,
    );

    if (pathMatch && pathMatch[1]) {
      // Return the path part (bucket/path/to/file)
      return decodeURIComponent(pathMatch[1]);
    }

    // If not a Supabase URL format, return based on fallback option
    return fallbackToUrl ? url : null;
  } catch {
    // If URL parsing fails, return based on fallback option
    return fallbackToUrl ? url : null;
  }
};

/**
 * Extracts the base path from a signed URL for comparison/deduplication purposes.
 * Similar to extractPathFromSignedUrl but always returns a string (never null).
 * Used in Apollo Client cache merge functions.
 *
 * @param url - The URL to extract the base path from
 * @returns The extracted path or the URL without query params
 */
export const getBasePathFromSignedUrl = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return url || '';
  }

  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(
      /\/storage\/v1\/object\/sign\/(.+)/,
    );

    if (pathMatch && pathMatch[1]) {
      return decodeURIComponent(pathMatch[1]);
    }

    // If not a Supabase signed URL, return URL without query params
    return urlObj.pathname + urlObj.search.split('?')[0];
  } catch {
    // If URL parsing fails, try simple string manipulation
    return url.split('?')[0];
  }
};
