import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Collapse,
  Stack,
  Chip,
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  ExpandMore,
  ExpandLess,
  BugReport,
  Home,
} from '@mui/icons-material';
import { config } from '../config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'global';
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
  showDetails: boolean;
}

/**
 * Enhanced Error Boundary with comprehensive error handling
 * Provides different fallback UIs based on error level and context
 */
export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (config.app.debug) {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // Report error to external service
    this.reportError(error, errorInfo);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, children } = this.props;
    const { hasError } = this.state;

    if (hasError && resetOnPropsChange && prevProps.children !== children) {
      this.handleReset();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Send to Sentry or other error reporting service
      if (config.external.sentryDsn && config.logging.enableErrorReporting) {
        // Simulate error reporting
        const errorData = {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          userId: localStorage.getItem(config.auth.tokenKey) ? 'authenticated' : 'anonymous',
        };

        console.log('Error reported:', errorData);
        // In production, replace with actual error reporting service call
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      showDetails: false,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  private renderErrorDetails() {
    const { error, errorInfo } = this.state;

    if (!config.app.debug || !error) {
      return null;
    }

    return (
      <Collapse in={this.state.showDetails}>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Error Details (Development Mode)
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mb: 2 }}>
            <strong>Message:</strong> {error.message}
          </Typography>
          {error.stack && (
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mb: 2 }}>
              <strong>Stack Trace:</strong>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{error.stack}</pre>
            </Typography>
          )}
          {errorInfo?.componentStack && (
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
              <strong>Component Stack:</strong>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{errorInfo.componentStack}</pre>
            </Typography>
          )}
        </Box>
      </Collapse>
    );
  }

  private renderFallbackUI() {
    const { level = 'component' } = this.props;
    const { error } = this.state;

    // Custom fallback
    if (this.props.fallback) {
      return this.props.fallback;
    }

    // Global error (full page)
    if (level === 'global') {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            bgcolor: 'background.default',
          }}
        >
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <ErrorOutline sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Oops! Something went wrong
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                We're sorry for the inconvenience. The application encountered an unexpected error.
              </Typography>
              
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={this.handleGoHome}
                >
                  Go Home
                </Button>
              </Stack>

              {config.app.debug && (
                <Box>
                  <Button
                    size="small"
                    startIcon={this.state.showDetails ? <ExpandLess /> : <ExpandMore />}
                    onClick={this.toggleDetails}
                  >
                    {this.state.showDetails ? 'Hide' : 'Show'} Details
                  </Button>
                  {this.renderErrorDetails()}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      );
    }

    // Page level error
    if (level === 'page') {
      return (
        <Box sx={{ p: 3 }}>
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" size="small" onClick={this.handleReset}>
                Try Again
              </Button>
            }
            sx={{ mb: 2 }}
          >
            <Typography variant="h6" gutterBottom>
              Unable to load this page
            </Typography>
            <Typography variant="body2">
              {error?.message || 'An unexpected error occurred while loading this page.'}
            </Typography>
          </Alert>
          
          {config.app.debug && (
            <Box>
              <Button
                size="small"
                startIcon={<BugReport />}
                onClick={this.toggleDetails}
              >
                Debug Info
              </Button>
              {this.renderErrorDetails()}
            </Box>
          )}
        </Box>
      );
    }

    // Component level error (default)
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <ErrorOutline sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Component failed to load
        </Typography>
        
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
          <Button size="small" onClick={this.handleReset}>
            Retry
          </Button>
          
          {config.app.debug && (
            <Chip
              label="Debug"
              size="small"
              clickable
              onClick={this.toggleDetails}
              icon={<BugReport />}
            />
          )}
        </Stack>

        {this.renderErrorDetails()}
      </Box>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallbackUI();
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, _errorInfo?: any) => {
    // Throw error to be caught by nearest error boundary
    throw error;
  }, []);

  return handleError;
};

export default ErrorBoundary;