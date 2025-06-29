import React, { useState, useRef, useEffect } from "react";
import { FaShieldAlt, FaLock, FaArrowRight } from "react-icons/fa";

interface OTPValidationProps {
  title: string;
  description: string;
  onValidate: (otp: string) => void;
  onCancel: () => void;
  processingLabel?: string;
  initialOtp?: string;
}

const OTPValidation: React.FC<OTPValidationProps> = ({
  title,
  description,
  onValidate,
  onCancel,
  processingLabel = "Validate",
  initialOtp = "",
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [activeOTPIndex, setActiveOTPIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeOTPIndex]);

  useEffect(() => {
    if (initialOtp) {
      const otpArray = initialOtp.split("").slice(0, 6);
      while (otpArray.length < 6) {
        otpArray.push("");
      }
      setOtp(otpArray);
    }
  }, [initialOtp]);

  const handleOnChange = (
    { target }: React.ChangeEvent<HTMLInputElement>,
    index: number
  ): void => {
    const { value } = target;
    const newOTP: string[] = [...otp];
    newOTP[index] = value.substring(value.length - 1);
    setOtp(newOTP);

    // Move to next input if current field is filled
    if (!value) setActiveOTPIndex(index - 1);
    else setActiveOTPIndex(index + 1);
  };

  const handleOnKeyDown = (
    { key }: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    setActiveOTPIndex(index);
    if (key === "Backspace") setActiveOTPIndex(index - 1);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    
    if (otpValue.length !== 6) {
      return;
    }

    setIsProcessing(true);
    onValidate(otpValue);
    setIsProcessing(false);
  };

  const isOtpComplete = otp.every(digit => digit !== "") && otp.join("").length === 6;

  return (
    <div className="fixed inset-0 bg-white/40 backdrop-blur-lg flex items-center justify-center z-[100] p-4 transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          {/* OTP Input Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaLock className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Enter 6-digit code</span>
            </div>
            
            <div className="flex justify-center gap-3">
              {otp.map((_, index) => (
                <div key={index} className="relative">
                  <input
                    ref={index === activeOTPIndex ? inputRef : null}
                    type="number"
                    className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl transition-all duration-200 focus:outline-none ${
                      otp[index] 
                        ? "border-blue-500 bg-blue-50 text-blue-600" 
                        : activeOTPIndex === index
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-300 bg-gray-50 hover:border-gray-400"
                    }`}
                    onChange={(e) => handleOnChange(e, index)}
                    onKeyDown={(e) => handleOnKeyDown(e, index)}
                    value={otp[index]}
                    min="0"
                    max="9"
                  />
                  {otp[index] && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center">
              <div className="flex gap-1">
                {otp.map((digit, index) => (
                  <div
                    key={index}
                    className={`w-2 h-1 rounded-full transition-all duration-200 ${
                      digit ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !isOtpComplete}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                isOtpComplete && !isProcessing
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  {processingLabel}
                  <FaArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Helper text */}
          <div className="text-center text-sm text-gray-500">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-medium"
              onClick={() => {
                // Add resend functionality here
                console.log("Resend OTP");
              }}
            >
              Resend
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPValidation;
