"use client";

import React from "react";

interface ErrorStateProps {
  /** Title of the error message */
  title?: string;
  /** The error object or message to display */
  error?: unknown;
  /** Custom message to display (overrides error extraction) */
  message?: string;
  /** Action button configuration */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Whether to show in full screen mode */
  fullScreen?: boolean;
  /** Custom class name for the container */
  className?: string;
}

/**
 * Extract error message from various error types (Axios, Error, string, etc.)
 */
export const getErrorMessage = (err: unknown): string => {
  if (!err) return "An unexpected error occurred";
  
  if (typeof err === "string") return err;
  
  if (err && typeof err === "object") {
    // Axios error with response data
    const axiosErr = err as { 
      response?: { data?: { message?: string } }; 
      message?: string 
    };
    
    if (axiosErr.response?.data?.message) {
      return axiosErr.response.data.message;
    }
    
    // Standard Error object
    if (axiosErr.message) {
      return axiosErr.message;
    }
  }
  
  return "An unexpected error occurred";
};

/**
 * Reusable error state component for displaying API errors and other error states
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  error,
  message,
  action,
  fullScreen = false,
  className = "",
}) => {
  const errorMessage = message || (error ? getErrorMessage(error) : "An unexpected error occurred");

  const content = (
    <div className={`bg-white rounded-lg border border-slate-200 p-8 text-center ${className}`}>
      <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <svg
          className="w-6 h-6 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-600 mb-4">{errorMessage}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-5xl mx-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default ErrorState;
