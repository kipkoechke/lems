// components/StatusCard.tsx
import React from "react";

interface StatusCardProps {
  title: string;
  status: "success" | "pending" | "error" | "info";
  message: string;
  details?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  status,
  message,
  details,
}) => {
  const getStatusColors = () => {
    switch (status) {
      case "success":
        return "bg-green-100 border-green-500 text-green-700";
      case "pending":
        return "bg-yellow-100 border-yellow-500 text-yellow-700";
      case "error":
        return "bg-red-100 border-red-500 text-red-700";
      case "info":
        return "bg-blue-100 border-blue-500 text-blue-700";
      default:
        return "bg-gray-100 border-gray-500 text-gray-700";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "pending":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "error":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "info":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`border-l-4 p-4 mb-4 rounded-md ${getStatusColors()}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">{getStatusIcon()}</div>
        <div className="ml-3">
          <h3 className="font-medium">{title}</h3>
          <div className="mt-2 text-sm">
            <p>{message}</p>
            {details && <p className="mt-1 text-xs opacity-75">{details}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
