import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log error info to an error reporting service here
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Something went wrong.</h1>
          <p className="text-gray-700 mb-4">
            Please try refreshing the page. If the problem persists, contact our support team:
          </p>
          <div className="mb-4 text-center">
            <div className="mb-2">
              <span className="font-semibold">Phone:</span><br />
              <a href="tel:+11234567890" className="text-blue-600 hover:underline">+1 (123) 456-7890</a><br />
              <a href="tel:+19876543210" className="text-blue-600 hover:underline">+1 (987) 654-3210</a>
            </div>
            <div>
              <span className="font-semibold">Email:</span><br />
              <a href="mailto:tourismpanglaocentral@gmail.com" className="text-blue-600 hover:underline">tourismpanglaocentral@gmail.com</a><br />
              <a href="mailto:statistics.tourismpanglao@gmail.com" className="text-blue-600 hover:underline">statistics.tourismpanglao@gmail.com</a>
            </div>
          </div>
          {/* Optionally show error details in development */}
          {import.meta.env.MODE === "development" && (
            <pre className="bg-gray-100 p-2 rounded text-xs text-red-800">
              {this.state.error && this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 
