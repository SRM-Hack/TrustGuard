import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "Unknown error",
    };
  }

  componentDidCatch(error, info) {
    console.error("[TruthGuard ErrorBoundary]", error, info);
  }

  renderDefaultFallback() {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-3xl">🛡️</p>
        <h2 className="mt-3 text-xl font-semibold text-red-800">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-red-700">
          An unexpected error occurred in this section. Try refreshing the page.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || this.renderDefaultFallback();
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
