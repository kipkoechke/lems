import { goToNextStep, goToPreviousStep } from "@/context/workflowSlice";
import { useAppDispatch } from "@/hooks/hooks";
import BackButton from "@/components/BackButton";
import React from "react";
import { FaCheckCircle, FaVial } from "react-icons/fa";

const ProceedToTests: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <FaCheckCircle className="text-green-500 text-5xl mb-4" />
      <h2 className="text-xl font-semibold mb-2">Ready to Proceed for Tests</h2>
      <p className="text-gray-700 mb-6">
        Patient consent has been verified. Click below to proceed to the
        diagnostic tests.
      </p>
      <div className="flex justify-between items-center w-full max-w-md">
        <BackButton 
          onClick={() => dispatch(goToPreviousStep())}
        />
        <button
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          onClick={() => dispatch(goToNextStep())}
        >
          <FaVial className="mr-2" /> Proceed for Tests
        </button>
      </div>
    </div>
  );
};

export default ProceedToTests;
