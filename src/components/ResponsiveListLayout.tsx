import { ReactNode, useState } from "react";
import { FaBars, FaList, FaTh } from "react-icons/fa";

export type ViewMode = "table" | "cards";

interface ResponsiveListLayoutProps {
  children: ReactNode;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  showViewToggle?: boolean;
  headerContent?: ReactNode;
  mobileContent?: ReactNode;
  className?: string;
}

export default function ResponsiveListLayout({
  children,
  viewMode = "table",
  onViewModeChange,
  showViewToggle = true,
  headerContent,
  mobileContent,
  className = "",
}: ResponsiveListLayoutProps) {
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(viewMode);

  const handleViewModeChange = (mode: ViewMode) => {
    setCurrentViewMode(mode);
    onViewModeChange?.(mode);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}
    >
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header with optional view toggle */}
        {(headerContent || showViewToggle) && (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">{headerContent}</div>

              {showViewToggle && (
                <div className="flex items-center bg-white rounded-lg shadow-sm p-1">
                  <button
                    onClick={() => handleViewModeChange("table")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentViewMode === "table"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FaList className="w-4 h-4" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                  <button
                    onClick={() => handleViewModeChange("cards")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentViewMode === "cards"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FaTh className="w-4 h-4" />
                    <span className="hidden sm:inline">Cards</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Desktop table view */}
          <div
            className={`${
              currentViewMode === "table" ? "hidden md:block" : "hidden"
            }`}
          >
            {children}
          </div>

          {/* Mobile card view */}
          <div className={`${currentViewMode === "cards" || "md:hidden"}`}>
            {mobileContent || (
              <div className="p-6 text-center text-gray-500">
                <FaBars className="w-8 h-8 mx-auto mb-3" />
                <p>Mobile view not implemented yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ResponsiveHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  searchContent?: ReactNode;
  statsContent?: ReactNode;
}

export function ResponsiveHeader({
  title,
  subtitle,
  icon,
  actions,
  searchContent,
  statsContent,
}: ResponsiveHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && <div className="p-3 bg-blue-100 rounded-xl">{icon}</div>}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm md:text-base text-gray-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex flex-col sm:flex-row gap-2">{actions}</div>
        )}
      </div>

      {/* Search section */}
      {searchContent && (
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          {searchContent}
        </div>
      )}

      {/* Stats section */}
      {statsContent && <div>{statsContent}</div>}
    </div>
  );
}
