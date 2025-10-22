/**
 * Token validation utilities
 * Single Responsibility: Validate token expiration states
 */
export class TokenValidator {
  // Constants for token refresh timing
  private static readonly REFRESH_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
  private static readonly REFRESH_PERCENTAGE = 0.7; // 70% of token lifetime
  private static readonly MIN_REFRESH_BUFFER_MS = 20000; // 20 seconds

  /**
   * Check if token needs refresh (within 10 minutes of expiry)
   */
  static needsRefresh(expiresAt: number | null): boolean {
    if (!expiresAt) {
      return false;
    }
    return expiresAt <= Date.now() + this.REFRESH_THRESHOLD_MS;
  }

  /**
   * Check if token is completely expired
   */
  static isExpired(expiresAt: number | null): boolean {
    if (!expiresAt) {
      return true;
    }
    return expiresAt <= Date.now();
  }

  /**
   * Calculate optimal time for background refresh
   * Returns time in milliseconds until refresh should occur
   */
  static calculateRefreshTime(expiresAt: number): number | null {
    const now = Date.now();
    const tokenLifetime = expiresAt - now;

    // Calculate refresh time (70% of lifetime or 10 minutes before expiry)
    const refreshTime = Math.min(
      tokenLifetime * this.REFRESH_PERCENTAGE,
      tokenLifetime - this.REFRESH_THRESHOLD_MS,
    );

    // Only return valid refresh time if it's at least 30 seconds
    return refreshTime > this.MIN_REFRESH_BUFFER_MS ? refreshTime : null;
  }

  /**
   * Check if error is a "token already used" error
   */
  static isTokenAlreadyUsedError(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.message.includes('Token already used') ||
        error.message.includes('Invalid Refresh Token') ||
        error.message.includes('Already Used'))
    );
  }
}
