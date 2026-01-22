import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface TextAreaFieldProps {
  label: string;
  placeholder: string;
  register: UseFormRegisterReturn;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  placeholder,
  register,
  error,
  required = false,
  disabled = false,
  rows = 4,
}) => {
  return (
    <div>
      <label className="text-gray-700 mb-2 flex text-xs sm:text-sm font-semibold">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <textarea
        {...register}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg placeholder:text-gray-500 border px-4 py-3 text-sm transition-all duration-300 focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 resize-none"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
