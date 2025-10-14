import {loggingService} from '../logging.service';
import {AuthResponse} from '../../types/auth.types';
import {AuthStorage} from './AuthStorage';

/**
 * Manages token refresh mutex to prevent concurrent refresh requests
 * Implements the Singleton pattern with promise-based locking
 */
export class TokenRefreshManager {
  private static instance: TokenRefreshManager;
  private isRefreshing = false;
  private refreshPromise: Promise<AuthResponse> | null = null;
  private static readonly REFRESH_TIMEOUT_MS = 30000; // 30 seconds

  private constructor() {}

  static getInstance(): TokenRefreshManager {
    if (!TokenRefreshManager.instance) {
      TokenRefreshManager.instance = new TokenRefreshManager();
    }
    return TokenRefreshManager.instance;
  }

  /**
   * Execute refresh with mutex protection and 30-second timeout
   * Returns existing promise if refresh is already in progress
   * Clears auth storage if refresh doesn't complete within 30 seconds
   */
  async executeRefresh(
    refreshFn: () => Promise<AuthResponse>,
  ): Promise<AuthResponse> {
    // If refresh is already in progress, return the existing promise
    if (this.refreshPromise) {
      loggingService.info(
        'Refresh already in progress, reusing existing promise',
      );
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    try {
      // Create timeout promise that rejects after 30 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Token refresh timeout after 30 seconds'));
        }, TokenRefreshManager.REFRESH_TIMEOUT_MS);
      });

      // Create and store the refresh promise immediately
      this.refreshPromise = refreshFn();

      // Race between refresh and timeout
      const result = await Promise.race([this.refreshPromise, timeoutPromise]);

      return result;
    } catch (error) {
      // If timeout occurred or any other error, clear auth storage
      if (error instanceof Error && error.message.includes('timeout')) {
        loggingService.error(
          'Token refresh timed out after 30 seconds, clearing auth storage',
          error,
        );
        try {
          await AuthStorage.clearAll();
          loggingService.info('Auth storage cleared due to refresh timeout');
        } catch (clearError) {
          loggingService.error('Failed to clear auth storage:', clearError);
        }
      } else {
        loggingService.error('Token refresh failed:', error);
      }
      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }

  getRefreshPromise(): Promise<AuthResponse> | null {
    return this.refreshPromise;
  }
}
