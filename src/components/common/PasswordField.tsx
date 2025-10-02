import { useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface PasswordFieldProps {
  label: string;
  placeholder: string;
  register: UseFormRegisterReturn;
  error?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  placeholder,
  register,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="text-gray-700 mb-2 flex flex-col text-xs sm:text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        <input
          {...register}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className="border-gray-300 hover:border-blue-400 text-gray-700 focus:border-blue-500 focus:ring-blue-500 w-full rounded-lg border px-3 py-2.5 sm:px-4 sm:py-2 text-sm focus:ring focus:outline-none"
          aria-label={placeholder}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 focus:top-1/2 focus:-translate-y-1/2 focus:text-gray-700 focus:outline-none p-1"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
