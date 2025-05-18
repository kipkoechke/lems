// components/OTPValidation.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";

interface OTPValidationProps {
  title: string;
  description: string;
  onValidate: (otp: string) => void;
  onCancel: () => void;
  processingLabel?: string;
}

interface OTPForm {
  otp: string;
}

const OTPValidation: React.FC<OTPValidationProps> = ({
  title,
  description,
  onValidate,
  onCancel,
  processingLabel = "Validate",
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPForm>();

  const onSubmit = (data: OTPForm) => {
    setIsProcessing(true);
    // Simulate processing delay
    setTimeout(() => {
      onValidate(data.otp);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">{title}</h2>
      <p className="mb-6 text-gray-600">{description}</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6">
          <label htmlFor="otp" className="block text-gray-700 mb-2">
            Enter OTP Code
          </label>
          <input
            {...register("otp", {
              required: "OTP is required",
              pattern: {
                value: /^\d{6}$/,
                message: "OTP must be 6 digits",
              },
            })}
            id="otp"
            type="text"
            placeholder="Enter 6-digit OTP"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.otp && (
            <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
          )}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isProcessing ? "Processing..." : processingLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OTPValidation;
