import React, {ComponentType} from 'react';
import ErrorBoundary from './ErrorBoundary';
import NetworkStatusBar from './NetworkAware';
import {View, StyleSheet} from 'react-native';
import {loggingService} from '@services/logging.service';

interface WithErrorHandlingOptions {
  /**
   * Whether to include the network status bar
   */
  withNetworkStatus?: boolean;

  /**
   * Message to show when the device is offline
   */
  offlineMessage?: string;

  /**
   * Component name for logging
   */
  componentName?: string;

  /**
   * Custom fallback component to render when an error occurs
   */
  fallbackComponent?: React.ReactNode;
}

/**
 * Higher-order component that wraps a component with error handling capabilities
 *
 * @param Component The component to wrap
 * @param options Options for error handling
 * @returns The wrapped component with error handling
 */
export const withErrorHandling = <P extends object>(
  Component: ComponentType<P>,
  options: WithErrorHandlingOptions = {},
): React.FC<P> => {
  const {
    withNetworkStatus = true,
    offlineMessage,
    componentName = Component.displayName || Component.name || 'Component',
    fallbackComponent,
  } = options;

  // Create the wrapped component
  const WrappedComponent: React.FC<P> = (props: P) => {
    // Log component mount
    React.useEffect(() => {
      loggingService.debug(`Component mounted: ${componentName}`);

      return () => {
        loggingService.debug(`Component unmounted: ${componentName}`);
      };
    }, []);

    return (
      <ErrorBoundary
        fallbackComponent={fallbackComponent}
        onError={(error, errorInfo) => {
          loggingService.error(`Error in component: ${componentName}`, error, {
            componentStack: errorInfo.componentStack,
          });
        }}>
        <View style={styles.container}>
          {withNetworkStatus && (
            <NetworkStatusBar offlineMessage={offlineMessage} />
          )}
          <Component {...props} />
        </View>
      </ErrorBoundary>
    );
  };

  // Set display name for debugging
  WrappedComponent.displayName = `withErrorHandling(${componentName})`;

  return WrappedComponent;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default withErrorHandling;
