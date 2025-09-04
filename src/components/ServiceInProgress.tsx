import { goToNextStep, goToPreviousStep } from "@/context/workflowSlice";
import { useAppDispatch } from "@/hooks/hooks";
import BackButton from "@/components/BackButton";
import React, { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaStethoscope,
} from "react-icons/fa";

const ServiceInProgress: React.FC = () => {
  const dispatch = useAppDispatch();
  const [canProceed, setCanProceed] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate service progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setCanProceed(true), 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FaStethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Healthcare Service Booking
                </h1>
                <p className="text-sm text-gray-600">Service In Progress</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Service Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FaStethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Medical Service In Progress
                </h2>
                <p className="text-green-100">
                  Your healthcare service is currently being provided
                </p>
              </div>
            </div>
          </div>

          <div className="p-12 text-center">
            {/* Animated Medical Icon */}
            <div className="mb-8">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                  <FaStethoscope className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 w-24 h-24 border-4 border-green-200 rounded-full animate-ping"></div>
                <div className="absolute inset-0 w-32 h-32 border-2 border-green-100 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {progress < 100
                  ? "Service Being Provided..."
                  : "Service Completed!"}
              </h3>
              <p className="text-gray-600 mb-6">
                {progress < 100
                  ? "Please wait while your medical service is being carried out by our healthcare professionals."
                  : "Your medical service has been completed successfully. You may now proceed to the fulfillment verification."}
              </p>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Icons */}
              <div className="flex justify-center items-center gap-8 mb-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                    <FaCheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">
                    Booking Confirmed
                  </span>
                </div>
                <div className="w-12 h-0.5 bg-green-300"></div>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      progress >= 50 ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <FaClock
                      className={`w-6 h-6 ${
                        progress >= 50 ? "text-white" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      progress >= 50 ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    Service Active
                  </span>
                </div>
                <div
                  className={`w-12 h-0.5 ${
                    progress >= 100 ? "bg-green-300" : "bg-gray-300"
                  }`}
                ></div>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      progress >= 100 ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <FaCheckCircle
                      className={`w-6 h-6 ${
                        progress >= 100 ? "text-white" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      progress >= 100 ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    Service Complete
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {canProceed && (
              <div className="animate-fade-in flex flex-col items-center gap-4">
                <div className="flex justify-between items-center w-full max-w-lg">
                  <BackButton onClick={() => dispatch(goToPreviousStep())} />
                  <button
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-bold text-lg"
                    onClick={() => dispatch(goToNextStep())}
                  >
                    <FaCheckCircle className="w-5 h-5" />
                    Proceed to Service Fulfillment
                    <FaArrowRight className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-500 text-sm text-center">
                  Complete the verification process to finalize your service
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ServiceInProgress;
