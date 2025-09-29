import { UseFormRegisterReturn } from "react-hook-form";

interface InputFieldProps {
  label: string;
  type: string;
  placeholder: string;
  register: UseFormRegisterReturn;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export const InputField = ({
  label,
  type,
  placeholder,
  register,
  error,
  required = false,
  disabled = false,
}: InputFieldProps) => (
  <div>
    <label className="text-gray-700 mb-2 flex text-xs sm:text-sm font-semibold">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    <input
      {...register}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg placeholder:text-gray-400 border px-4 py-3 text-sm transition-all duration-300 focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
