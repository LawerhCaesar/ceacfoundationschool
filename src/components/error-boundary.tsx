import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Log error to external service in production
    this.logErrorToService(error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({
      errorInfo,
    });
  }

  private logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // In production, you would send this to an error tracking service like:
    // - Sentry
    // - LogRocket
    // - Rollbar
    // - Custom logging endpoint

    const errorLog = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Store in localStorage for debugging
    try {
      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingLogs.push(errorLog);
      // Keep only last 10 errors
      if (existingLogs.length > 10) {
        existingLogs.shift();
      }
      localStorage.setItem('error_logs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Failed to store error log:', e);
    }

    // In production, send to error tracking service
    if (import.meta.env.PROD) {
      // Example: fetch('/api/log-error', { method: 'POST', body: JSON.stringify(errorLog) });
      console.error('Production error logged:', errorLog);
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Something went wrong</CardTitle>
                  <CardDescription>
                    We encountered an unexpected error. The error has been logged and we'll look into it.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {import.meta.env.DEV && this.state.error && (
                <div className="space-y-3">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium text-destructive mb-2">Error Details (Development Only):</p>
                    <p className="text-sm font-mono text-muted-foreground mb-2">
                      {this.state.error.message}
                    </p>
                    {this.state.error.stack && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer hover:text-foreground">Stack Trace</summary>
                        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">You can try:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Refreshing the page to try again</li>
                  <li>Going back to the home page</li>
                  <li>Clearing your browser cache</li>
                  <li>Contacting support if the problem persists</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button onClick={this.handleReset} variant="default" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary wrapper for functional components
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
};



