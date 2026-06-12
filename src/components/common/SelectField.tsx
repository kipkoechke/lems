"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { MdExpandMore, MdSearch } from "react-icons/md";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import type { UseFormRegisterReturn } from "react-hook-form";

interface SelectFieldProps {
  label: string;
  register?: UseFormRegisterReturn;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  options: { value: string; label: string; description?: string }[];
  className?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  register,
  value: controlledValue,
  onChange: controlledOnChange,
  error,
  required = false,
  disabled = false,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  options,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useOutsideClick(() => setIsOpen(false));
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Resolve current value from either register (RHF) or controlled props
  const currentValue = controlledValue ?? (register ? undefined : "");
  const selectedOption = options.find((o) => o.value === currentValue);

  const handleChange = (val: string) => {
    // Support both React Hook Form register and controlled mode
    if (register) {
      register.onChange({ target: { value: val, name: register.name } });
    }
    controlledOnChange?.(val);
    setIsOpen(false);
    setSearchQuery("");
  };

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q),
    );
  }, [options, searchQuery]);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Hidden native select for react-hook-form register */}
      {register && (
        <select {...register} className="hidden" disabled={disabled}>
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}

      {/* Visible searchable dropdown */}
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 bg-white text-left flex items-center justify-between"
        >
          <span
            className={selectedOption ? "text-gray-900" : "text-gray-500"}
          >
            {selectedOption?.label || placeholder}
          </span>
          <MdExpandMore
            className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-72 overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-center text-gray-500 text-sm">
                  No results found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange(option.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors ${
                      option.value === currentValue
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-900"
                    }`}
                  >
                    <div>{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-500">
                        {option.description}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
};
