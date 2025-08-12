import { ReactNode } from "react";

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export default function ResponsiveTable({
  children,
  className = "",
}: ResponsiveTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MobileCard({
  children,
  className = "",
  onClick,
}: MobileCardProps) {
  return (
    <div
      className={`bg-white p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface MobileCardRowProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function MobileCardRow({
  label,
  value,
  className = "",
}: MobileCardRowProps) {
  return (
    <div className={`flex justify-between items-center py-1 ${className}`}>
      <span className="text-sm font-medium text-gray-500">{label}:</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}
