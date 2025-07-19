import React, {Component, ErrorInfo, ReactNode} from 'react';
import {View, StyleSheet} from 'react-native';
import {loggingService} from '@services/logging.service';
import {errorService} from '@services/error.service';
import {Body, Button, Title} from '@components';
import {colors, spacing} from '@theme';
import i18n from '@/i18n/i18n';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to Sentry
    loggingService.error('Component error', error, {
      componentStack: errorInfo.componentStack,
    });

    // Show a toast with the error message
    errorService.showErrorToast(i18n.t('errors.general.something_wrong'));

    // Call optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });

    // Call optional onReset callback
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    const {hasError} = this.state;
    const {children, fallbackComponent} = this.props;

    if (hasError) {
      // If a custom fallback component is provided, render it
      if (fallbackComponent) {
        return fallbackComponent;
      }

      // Otherwise render the default fallback UI
      return (
        <View style={styles.container}>
          <Title align="center" color={colors.primary.main}>
            {i18n.t('errors.general.something_wrong')}
          </Title>
          <Body align="center" color={colors.neutral.grey}>
            {i18n.t('errors.general.unexpected_error')}
          </Body>
          <Button
            onPress={this.resetError}
            variant="primary"
            shape="round"
            title={i18n.t('common.try_again')}
          />
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
});

export default ErrorBoundary;
