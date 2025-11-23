import React from "react";
import "../styles/errorBoundary.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error("Error caught by boundary:", error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1,
    });

    // TODO: Log to error reporting service in production
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Check if errors are occurring repeatedly
      const isRepeating = this.state.errorCount > 2;

      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__icon">⚠️</div>

            <h1 className="error-boundary__title">
              {isRepeating ? "Persistent Error" : "Oops! Something went wrong"}
            </h1>

            <p className="error-boundary__message">
              {isRepeating
                ? "This error keeps happening. Please refresh the page or contact support if the problem persists."
                : "We're sorry for the inconvenience. The application encountered an unexpected error."}
            </p>

            {/* Show error details in development */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="error-boundary__details">
                <summary>Error Details (Development Only)</summary>
                <div className="error-boundary__error-info">
                  <strong>Error:</strong>
                  <pre>{this.state.error.toString()}</pre>
                  <strong>Stack Trace:</strong>
                  <pre>{this.state.errorInfo?.componentStack}</pre>
                </div>
              </details>
            )}

            <div className="error-boundary__actions">
              {!isRepeating && (
                <button
                  className="error-boundary__button error-boundary__button--primary"
                  onClick={this.handleReset}
                >
                  Try Again
                </button>
              )}

              <button
                className="error-boundary__button error-boundary__button--secondary"
                onClick={this.handleReload}
              >
                Reload Page
              </button>

              <button
                className="error-boundary__button error-boundary__button--tertiary"
                onClick={() => window.history.back()}
              >
                Go Back
              </button>
            </div>

            {/* Helpful tips */}
            <div className="error-boundary__tips">
              <p className="error-boundary__tips-title">What you can try:</p>
              <ul className="error-boundary__tips-list">
                <li>Refresh the page</li>
                <li>Clear your browser cache</li>
                <li>Try a different browser</li>
                <li>Check your internet connection</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
