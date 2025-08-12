import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  className?: string;
  iconBgColor?: string;
  iconTextColor?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  className = "",
  iconBgColor = "bg-blue-100",
  iconTextColor = "text-blue-600",
}: StatsCardProps) {
  return (
    <div
      className={`bg-white rounded-lg md:rounded-2xl shadow-sm md:shadow-lg p-3 md:p-6 hover:shadow-md md:hover:shadow-xl transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 md:gap-4">
            {icon && (
              <div
                className={`w-8 h-8 md:w-12 md:h-12 ${iconBgColor} rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0`}
              >
                <div className={`w-4 h-4 md:w-6 md:h-6 ${iconTextColor}`}>
                  {icon}
                </div>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                {value}
              </div>
              <div className="text-xs md:text-sm text-gray-600 truncate">
                {title}
              </div>
            </div>
          </div>

          {trend && (
            <div className="mt-3 flex items-center">
              <span
                className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                  trend.isPositive
                    ? "text-green-700 bg-green-100"
                    : "text-red-700 bg-red-100"
                }`}
              >
                {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
              </span>
              <span className="ml-2 text-xs text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatsGridProps {
  children: ReactNode;
  className?: string;
}

export function StatsGrid({ children, className = "" }: StatsGridProps) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 ${className}`}
    >
      {children}
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 md:py-16 px-4 ${className}`}>
      {icon && (
        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 text-gray-300">
          {icon}
        </div>
      )}
      <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm md:text-base text-gray-500 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading...",
  className = "",
}: LoadingStateProps) {
  return (
    <div className={`text-center py-12 md:py-16 ${className}`}>
      <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-sm md:text-base text-gray-500">{message}</p>
    </div>
  );
}
