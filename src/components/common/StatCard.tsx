import React from "react";
import Link from "next/link";

interface StatCardProps {
  title: string;
  mainValue: string | number;
  subtitle?: string | React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  percentage?: number | React.ReactNode;
  percentageLabel?: string | React.ReactNode;
  percentageColor?: "green" | "blue" | "yellow" | "red";
  compact?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  mainValue,
  subtitle,
  href,
  onClick,
  className = "",
  children,
  percentage,
  percentageLabel,
  percentageColor = "green",
  compact = false,
}) => {
  // Define color classes for percentage badges - more subtle
  const percentageColorClasses = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
  };

  const CardContent = (
    <div
      className={`bg-white rounded-lg shadow ${compact ? "p-2.5" : "p-3"} items-center flex flex-col justify-center hover:shadow-lg transition-shadow h-full ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between w-full h-full">
        <div className="w-full flex flex-col justify-between h-full">
          <div>
            <h3
              className={`${compact ? "text-xs" : "text-sm"} text-gray-800 mb-1 font-bold line-clamp-2`}
            >
              {title}
            </h3>

            <div className={`flex ${compact ? "gap-2" : "gap-4"} items-center`}>
              {children}
              <div
                className={`${compact ? "text-xl" : "text-3xl"} font-bold text-gray-950`}
              >
                {mainValue}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {subtitle && (
                <div
                  className={`${compact ? "text-[10px]" : "text-xs"} text-blue-900 font-bold mt-0.5`}
                >
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {/* Percentage area - always present to maintain consistent spacing */}
          {!compact && (
            <div className="mt-1 flex items-end">
              {percentage !== undefined ? (
                typeof percentage === "number" ? (
                  <div
                    className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-semibold ${percentageColorClasses[percentageColor]}`}
                  >
                    <span>{percentage.toFixed(1)}%</span>
                    {percentageLabel && (
                      <span className="opacity-75">{percentageLabel}</span>
                    )}
                  </div>
                ) : (
                  percentage
                )
              ) : (
                <div className="h-6"></div> // Placeholder to maintain consistent height
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // If href is provided, wrap the content in a Link
  if (href) {
    return (
      <Link href={href} className="block h-full">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
};

export default StatCard;
