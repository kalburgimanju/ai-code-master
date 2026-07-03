'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="card-glow max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-6">
              {this.state.error?.message?.includes('429')
                ? 'Rate limit exceeded. Please wait a moment and try again.'
                : 'An unexpected error occurred'}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="btn-primary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-3 bg-dark-800 rounded-lg text-xs text-gray-400 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Rate limit error component
export function RateLimitError({ onRetry }: { onRetry?: () => void }) {
  const [countdown, setCountdown] = React.useState(30);
  const [canRetry, setCanRetry] = React.useState(false);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanRetry(true);
    }
  }, [countdown]);

  return (
    <div className="card-glow border-amber-500/30 bg-amber-500/5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
          <Wifi className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-300 mb-1">Rate Limit Exceeded</h3>
          <p className="text-sm text-gray-400 mb-4">
            Too many requests. Please wait {countdown} seconds before trying again.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onRetry}
              disabled={!canRetry}
              className={`btn-primary flex items-center gap-2 ${!canRetry ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${!canRetry ? 'animate-spin' : ''}`} />
              {canRetry ? 'Retry Now' : `Wait ${countdown}s`}
            </button>
            <span className="text-xs text-gray-500">
              {countdown > 0 ? 'Auto-retry available soon' : 'Ready to retry'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
