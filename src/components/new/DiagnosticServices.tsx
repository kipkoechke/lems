"use client";
import { useWorkflow } from "@/context/WorkflowContext";
import React, { useEffect, useState } from "react";
import StatusCard from "./StatusCard";

const DiagnosticServices: React.FC = () => {
  const { state, dispatch, goToNextStep, goToPreviousStep } = useWorkflow();
  const [serviceStatus, setServiceStatus] = useState<
    "preparing" | "in-progress" | "completed"
  >("preparing");
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState("");

  // All hooks must be at the top level, before any conditional returns
  useEffect(() => {
    // Only run the effect if prerequisites are met and service is in progress
    if (
      state.patient &&
      state.selectedService &&
      state.serviceValidated &&
      serviceStatus === "in-progress" &&
      progress < 100
    ) {
      const timer = setTimeout(() => {
        setProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            setServiceStatus("completed");
            dispatch({ type: "COMPLETE_SERVICE", payload: true });
            return 100;
          }
          return newProgress;
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    serviceStatus,
    progress,
    dispatch,
    state.patient,
    state.selectedService,
    state.serviceValidated,
  ]);

  const handleStartService = () => {
    setServiceStatus("in-progress");
  };

  const handleCompleteService = () => {
    // In a real application, this would submit the diagnostic results and notes
    goToNextStep();
  };

  // Check prerequisites - moved after all hooks
  if (!state.patient || !state.selectedService || !state.serviceValidated) {
    return (
      <div className="max-w-2xl mx-auto">
        <StatusCard
          title="Service Not Ready"
          status="error"
          message="The service has not been properly validated."
          details="Please complete the previous steps first."
        />
        <div className="mt-4">
          <button
            onClick={goToPreviousStep}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Diagnostic Service</h2>
        <div className="flex items-center">
          <span className="text-gray-600 mr-2">Patient:</span>
          <span className="font-medium">{state.patient.patientName}</span>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Service</p>
            <p className="font-medium">{state.selectedService.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Service ID</p>
            <p className="font-medium">{state.selectedService.serviceId}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p
              className={`font-medium ${
                serviceStatus === "preparing"
                  ? "text-yellow-600"
                  : serviceStatus === "in-progress"
                  ? "text-blue-600"
                  : "text-green-600"
              }`}
            >
              {serviceStatus === "preparing"
                ? "Preparing"
                : serviceStatus === "in-progress"
                ? "In Progress"
                : "Completed"}
            </p>
          </div>
        </div>

        {serviceStatus === "in-progress" && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Progress</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              {progress}% complete
            </p>
          </div>
        )}

        {serviceStatus === "completed" && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Service Notes</p>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter diagnostic findings and notes about the procedure..."
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex justify-between items-center">
          {serviceStatus === "preparing" ? (
            <>
              <button
                onClick={goToPreviousStep}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Back
              </button>
              <button
                onClick={handleStartService}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Start Service
              </button>
            </>
          ) : serviceStatus === "in-progress" ? (
            <div className="w-full flex justify-center">
              <p className="text-blue-600 font-medium animate-pulse">
                Service in progress... Please wait
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  setServiceStatus("preparing");
                  setProgress(0);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Reset
              </button>
              <button
                onClick={handleCompleteService}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Complete & Continue
              </button>
            </>
          )}
        </div>
      </div>

      {serviceStatus !== "preparing" && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                {serviceStatus === "in-progress"
                  ? "The diagnostic service is currently being performed. Please ensure all safety protocols are followed."
                  : "Service has been completed. Please add any relevant notes before proceeding to invoice generation."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticServices;
