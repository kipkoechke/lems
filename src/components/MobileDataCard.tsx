import { ReactNode } from "react";

interface MobileDataCardProps {
  title: string;
  subtitle?: string;
  avatar?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function MobileDataCard({
  title,
  subtitle,
  avatar,
  children,
  actions,
  onClick,
  className = "",
}: MobileDataCardProps) {
  return (
    <div
      className={`bg-white border-b border-gray-200 p-3 md:p-4 hover:bg-gray-50 transition-colors ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
          {avatar && <div className="flex-shrink-0">{avatar}</div>}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs text-gray-500 truncate">{subtitle}</div>
            )}
          </div>
        </div>
        {actions && <div className="flex-shrink-0 ml-2">{actions}</div>}
      </div>
      <div className="mt-2 md:mt-3">{children}</div>
    </div>
  );
}

interface MobileFieldProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function MobileField({
  label,
  value,
  className = "",
}: MobileFieldProps) {
  return (
    <div className={`flex justify-between items-center py-1 ${className}`}>
      <span className="text-xs font-medium text-gray-500 flex-shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-900 text-right ml-2 min-w-0">
        {value}
      </span>
    </div>
  );
}

interface MobileFieldGroupProps {
  children: ReactNode;
  className?: string;
}

export function MobileFieldGroup({
  children,
  className = "",
}: MobileFieldGroupProps) {
  return <div className={`space-y-1 ${className}`}>{children}</div>;
}
