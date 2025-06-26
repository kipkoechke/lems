import { goToNextStep } from "@/context/workflowSlice";
import { useAppDispatch } from "@/hooks/hooks";
import React, { useEffect, useState } from "react";

const ServiceInProgress: React.FC = () => {
  const dispatch = useAppDispatch();
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCanProceed(true), 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <div className="mb-4">
        <svg
          className="animate-spin h-10 w-10 text-blue-600"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">
        Service Is Being Carried Out
      </h2>
      <p className="text-gray-600 mb-6">
        The service is being rendered. Please wait...
      </p>
      {canProceed && (
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => dispatch(goToNextStep())}
        >
          Proceed to Service Fulfillment
        </button>
      )}
    </div>
  );
};

export default ServiceInProgress;
