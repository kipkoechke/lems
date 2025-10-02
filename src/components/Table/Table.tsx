"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

// Table Context
interface TableContextType {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (column: string) => void;
}

const TableContext = createContext<TableContextType>({});

// Main Table Component
interface TableProps {
  children: ReactNode;
  className?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (column: string) => void;
}

const Table = ({
  children,
  className = "",
  sortBy,
  sortOrder,
  onSort,
}: TableProps) => {
  return (
    <TableContext.Provider value={{ sortBy, sortOrder, onSort }}>
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
};

// Table Header
interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

const TableHeader = ({ children, className = "" }: TableHeaderProps) => {
  return <thead className={`bg-gray-50 ${className}`}>{children}</thead>;
};

// Table Body
interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

const TableBody = ({ children, className = "" }: TableBodyProps) => {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
};

// Table Row
interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const TableRow = ({
  children,
  className = "",
  onClick,
  hover = true,
}: TableRowProps) => {
  const baseClasses = hover ? "hover:bg-gray-50" : "";
  const clickClasses = onClick ? "cursor-pointer" : "";

  return (
    <tr
      className={`${baseClasses} ${clickClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

// Table Header Cell
interface TableHeaderCellProps {
  children: ReactNode;
  className?: string;
  sortable?: boolean;
  sortKey?: string;
  align?: "left" | "center" | "right";
}

const TableHeaderCell = ({
  children,
  className = "",
  sortable = false,
  sortKey,
  align = "left",
}: TableHeaderCellProps) => {
  const { sortBy, sortOrder, onSort } = useContext(TableContext);

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const handleSort = () => {
    if (sortable && sortKey && onSort) {
      onSort(sortKey);
    }
  };

  const getSortIcon = () => {
    if (!sortable || !sortKey) return null;

    if (sortBy === sortKey) {
      return sortOrder === "asc" ? (
        <FaSortUp className="w-4 h-4 ml-1" />
      ) : (
        <FaSortDown className="w-4 h-4 ml-1" />
      );
    }

    return <FaSort className="w-4 h-4 ml-1 text-gray-400" />;
  };

  return (
    <th
      className={`px-6 py-3 ${
        alignClasses[align]
      } text-xs font-medium text-gray-500 uppercase tracking-wider ${
        sortable ? "cursor-pointer hover:bg-gray-100" : ""
      } ${className}`}
      onClick={handleSort}
    >
      <div className="flex items-center">
        {children}
        {getSortIcon()}
      </div>
    </th>
  );
};

// Table Cell
interface TableCellProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

const TableCell = ({
  children,
  className = "",
  align = "left",
}: TableCellProps) => {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${alignClasses[align]} ${className}`}
    >
      {children}
    </td>
  );
};

// Empty State
interface TableEmptyProps {
  children: ReactNode;
  colSpan: number;
  className?: string;
}

const TableEmpty = ({ children, colSpan, className = "" }: TableEmptyProps) => {
  return (
    <TableRow hover={false}>
      <TableCell className={`text-center py-12 ${className}`}>
        <div className="col-span-full">
          <td colSpan={colSpan} className="px-6 py-12 text-center">
            {children}
          </td>
        </div>
      </TableCell>
    </TableRow>
  );
};

// Loading State
interface TableLoadingProps {
  colSpan: number;
  rows?: number;
  className?: string;
}

const TableLoading = ({
  colSpan,
  rows = 5,
  className = "",
}: TableLoadingProps) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index} hover={false}>
          <td colSpan={colSpan} className={`px-6 py-4 ${className}`}>
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </td>
        </TableRow>
      ))}
    </>
  );
};

// Compound exports
Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.HeaderCell = TableHeaderCell;
Table.Cell = TableCell;
Table.Empty = TableEmpty;
Table.Loading = TableLoading;

export default Table;
