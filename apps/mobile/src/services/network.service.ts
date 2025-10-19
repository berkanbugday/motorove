import NetInfo, {
  NetInfoState,
  NetInfoSubscription,
} from '@react-native-community/netinfo';
import {errorService} from './error.service';
import {loggingService} from './logging.service';
import {useTranslation} from '@hooks/useTranslation';

/**
 * Network connectivity listener callback
 */
export type NetworkListener = (isConnected: boolean) => void;

/**
 * Service for monitoring network connectivity
 */
class NetworkService {
  private isConnected: boolean = true;
  private listeners: Set<NetworkListener> = new Set();
  private netInfoUnsubscribe: NetInfoSubscription | null = null;

  /**
   * Initialize the network monitoring service
   */
  initialize(): void {
    // Subscribe to network info changes
    this.netInfoUnsubscribe = NetInfo.addEventListener(
      this.handleNetInfoChange,
    );

    // Get initial state
    NetInfo.fetch().then(this.handleNetInfoChange);
  }

  /**
   * Cleanup network monitoring
   */
  cleanup(): void {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }
    this.listeners.clear();
  }

  /**
   * Handle network state changes
   */
  private handleNetInfoChange = (state: NetInfoState): void => {
    const wasConnected = this.isConnected;
    this.isConnected = Boolean(state.isConnected);
    const {t} = useTranslation();

    // If connection state changed, notify listeners
    if (wasConnected !== this.isConnected) {
      this.notifyListeners();

      // Show toast when connection status changes
      if (this.isConnected) {
        errorService.showSuccessToast(t('errors.network.connection_restored'));
      } else {
        errorService.showErrorToast(t('errors.network.no_internet_connection'));
      }
    }
  };

  /**
   * Add a network state listener
   */
  addListener(listener: NetworkListener): () => void {
    this.listeners.add(listener);

    // Immediately call the listener with current state
    listener(this.isConnected);

    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  /**
   * Remove a network state listener
   */
  removeListener(listener: NetworkListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of the current network state
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.isConnected);
      } catch (error) {
        loggingService.error('Error in network listener:', error);
      }
    });
  }

  /**
   * Check if currently connected to the internet
   */
  isNetworkConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get current network state (async version)
   * This will fetch the latest state from the device
   */
  async getCurrentNetworkState(): Promise<NetInfoState> {
    return await NetInfo.fetch();
  }
}

export const networkService = new NetworkService();
