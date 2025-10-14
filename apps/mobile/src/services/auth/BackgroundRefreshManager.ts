import {loggingService} from '../logging.service';
import {TokenValidator} from './TokenValidator';

/**
 * Manages background token refresh timer
 * Single Responsibility: Handle automatic token refresh scheduling
 */
export class BackgroundRefreshManager {
  private static instance: BackgroundRefreshManager;
  private refreshTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): BackgroundRefreshManager {
    if (!BackgroundRefreshManager.instance) {
      BackgroundRefreshManager.instance = new BackgroundRefreshManager();
    }
    return BackgroundRefreshManager.instance;
  }

  /**
   * Setup background refresh timer
   */
  setupRefresh(expiresAt: number, refreshCallback: () => Promise<void>): void {
    // Clear any existing timer
    this.clear();

    const refreshTime = TokenValidator.calculateRefreshTime(expiresAt);

    if (!refreshTime) {
      loggingService.warning('Token lifetime too short for background refresh');
      return;
    }

    loggingService.info(
      `Setting up background token refresh in ${Math.round(
        refreshTime / 1000,
      )} seconds`,
    );

    this.refreshTimer = setTimeout(async () => {
      try {
        loggingService.info('Executing background token refresh');
        await refreshCallback();
      } catch (error) {
        loggingService.error('Background token refresh failed:', error);
      }
    }, refreshTime);
  }

  /**
   * Clear the background refresh timer
   */
  clear(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Check if timer is currently active
   */
  isActive(): boolean {
    return this.refreshTimer !== null;
  }
}
