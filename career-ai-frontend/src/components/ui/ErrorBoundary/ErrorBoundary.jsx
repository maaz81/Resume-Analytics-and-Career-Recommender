import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '@common/Button';

/**
 * ErrorBoundary Component
 * Catches and displays React errors
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-background p-4">
          <div className="max-w-md w-full bg-surface-card rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-status-error-light flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-status-error" />
            </div>

            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Oops! Something went wrong
            </h2>

            <p className="text-text-secondary mb-6">
              {this.props.fallbackMessage ||
                'An unexpected error occurred. Please try refreshing the page.'}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-status-error-light rounded-lg text-left">
                <p className="text-sm font-mono text-status-error-dark break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <Button
              onClick={this.handleReset}
              variant="primary"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              fullWidth
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;