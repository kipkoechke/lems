"use client";

import React from "react";
import {
  FaArrowRight,
  FaCheckCircle,
  FaCreditCard,
  FaHeartbeat,
  FaHospital,
  FaPlay,
  FaStethoscope,
  FaUser,
  FaUserCheck,
  FaUserShield,
} from "react-icons/fa";

export interface WorkflowStep {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  category: "registration" | "service" | "fulfillment";
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  // Registration Phase
  {
    id: "facility",
    label: "Medical Facility",
    icon: FaHospital,
    description: "Select healthcare facility",
    color: "from-purple-500 to-purple-600",
    category: "registration",
  },
  {
    id: "patient",
    label: "Patient Details",
    icon: FaUser,
    description: "Patient information",
    color: "from-blue-500 to-blue-600",
    category: "registration",
  },
  {
    id: "payment",
    label: "Payment Method",
    icon: FaCreditCard,
    description: "Select payment option",
    color: "from-green-500 to-green-600",
    category: "registration",
  },

  // Service Phase
  {
    id: "recommendation",
    label: "Service Selection",
    icon: FaStethoscope,
    description: "Choose diagnostic service",
    color: "from-indigo-500 to-indigo-600",
    category: "service",
  },
  {
    id: "consent",
    label: "Patient Consent",
    icon: FaUserShield,
    description: "Verify patient consent",
    color: "from-orange-500 to-orange-600",
    category: "service",
  },

  // Fulfillment Phase
  {
    id: "proceedToTests",
    label: "Proceed to Tests",
    icon: FaPlay,
    description: "Begin service delivery",
    color: "from-pink-500 to-pink-600",
    category: "fulfillment",
  },
  {
    id: "serviceInProgress",
    label: "Service in Progress",
    icon: FaHeartbeat,
    description: "Service being performed",
    color: "from-red-500 to-red-600",
    category: "fulfillment",
  },
  {
    id: "fulfillment",
    label: "Service Fulfillment",
    icon: FaCheckCircle,
    description: "Complete and verify",
    color: "from-emerald-500 to-emerald-600",
    category: "fulfillment",
  },
];

interface WorkflowStepsProps {
  currentStep: string;
  completedSteps: string[];
  variant?: "full" | "mini" | "category";
  showCategory?: "registration" | "service" | "fulfillment";
  className?: string;
}

const WorkflowSteps: React.FC<WorkflowStepsProps> = ({
  currentStep,
  completedSteps,
  variant = "full",
  showCategory,
  className = "",
}) => {
  // Filter steps based on category if specified
  const stepsToShow = showCategory
    ? WORKFLOW_STEPS.filter((step) => step.category === showCategory)
    : WORKFLOW_STEPS;

  const getCurrentStepIndex = () => {
    return stepsToShow.findIndex((step) => step.id === currentStep);
  };

  const isStepCompleted = (stepId: string) => {
    return completedSteps.includes(stepId);
  };

  const isStepCurrent = (stepId: string) => {
    return currentStep === stepId;
  };

  const isStepActive = (stepId: string) => {
    const stepIndex = stepsToShow.findIndex((step) => step.id === stepId);
    const currentIndex = getCurrentStepIndex();
    return stepIndex <= currentIndex;
  };

  if (variant === "mini") {
    return (
      <div
        className={`flex items-center justify-center space-x-2 ${className}`}
      >
        {stepsToShow.map((step, index) => {
          const completed = isStepCompleted(step.id);
          const current = isStepCurrent(step.id);
          const active = isStepActive(step.id);

          return (
            <React.Fragment key={step.id}>
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  completed
                    ? "bg-green-500"
                    : current
                    ? "bg-blue-500 scale-125"
                    : active
                    ? "bg-blue-300"
                    : "bg-gray-300"
                }`}
              />
              {index < stepsToShow.length - 1 && (
                <div
                  className={`w-8 h-0.5 transition-all duration-300 ${
                    completed || (active && index < getCurrentStepIndex())
                      ? "bg-green-400"
                      : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  if (variant === "category") {
    return (
      <div
        className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 capitalize">
            {showCategory} Steps
          </h3>
          <div className="text-sm text-gray-600">
            {
              completedSteps.filter((id) =>
                stepsToShow.find((s) => s.id === id)
              ).length
            }
            /{stepsToShow.length} completed
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {stepsToShow.map((step, index) => {
            const completed = isStepCompleted(step.id);
            const current = isStepCurrent(step.id);
            const IconComponent = step.icon;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center group">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-md ${
                      completed
                        ? "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-green-200 scale-110"
                        : current
                        ? `bg-gradient-to-r ${step.color} text-white shadow-lg scale-105`
                        : "bg-white/80 backdrop-blur-sm text-gray-400 border-2 border-gray-200"
                    }`}
                  >
                    {completed ? (
                      <FaCheckCircle className="w-5 h-5 animate-pulse" />
                    ) : (
                      <IconComponent className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium mt-2 text-gray-700 text-center max-w-16">
                    {step.label}
                  </span>
                </div>
                {index < stepsToShow.length - 1 && (
                  <div
                    className={`w-8 h-1 rounded-full transition-all duration-500 ${
                      completed
                        ? "bg-gradient-to-r from-green-400 to-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div
      className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 ${className}`}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900">
            Workflow Progress
          </h2>
          <p className="text-gray-600">
            Track your progress through the healthcare workflow
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            {completedSteps.length}/{WORKFLOW_STEPS.length}
          </div>
          <div className="text-sm text-gray-600">Steps Completed</div>
        </div>
      </div>

      {/* Progress Categories */}
      <div className="space-y-8">
        {["registration", "service", "fulfillment"].map((category) => {
          const categorySteps = WORKFLOW_STEPS.filter(
            (step) => step.category === category
          );
          const categoryCompleted = completedSteps.filter((id) =>
            categorySteps.find((s) => s.id === id)
          ).length;

          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 capitalize">
                  {category} Phase
                </h3>
                <span className="text-sm font-medium text-gray-600">
                  {categoryCompleted}/{categorySteps.length} completed
                </span>
              </div>

              <div className="flex items-center space-x-6 overflow-x-auto pb-2">
                {categorySteps.map((step, index) => {
                  const completed = isStepCompleted(step.id);
                  const current = isStepCurrent(step.id);
                  const IconComponent = step.icon;

                  return (
                    <React.Fragment key={step.id}>
                      <div className="flex flex-col items-center group min-w-max">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${
                            completed
                              ? "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-green-200 scale-110"
                              : current
                              ? `bg-gradient-to-r ${step.color} text-white shadow-xl scale-105 animate-pulse`
                              : "bg-white/80 backdrop-blur-sm text-gray-400 border-2 border-gray-200 group-hover:border-blue-300"
                          }`}
                        >
                          {completed ? (
                            <FaCheckCircle className="w-7 h-7 animate-bounce" />
                          ) : (
                            <IconComponent className="w-7 h-7 transition-all duration-300 group-hover:scale-110" />
                          )}
                        </div>
                        <div className="text-center mt-3 max-w-24">
                          <div className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                            {step.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {step.description}
                          </div>
                        </div>
                      </div>
                      {index < categorySteps.length - 1 && (
                        <div
                          className={`w-12 h-1 rounded-full transition-all duration-500 flex-shrink-0 ${
                            completed
                              ? "bg-gradient-to-r from-green-400 to-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Progress Bar */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-gray-700">
            Overall Progress
          </span>
          <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            {Math.round((completedSteps.length / WORKFLOW_STEPS.length) * 100)}%
          </span>
        </div>
        <div className="relative w-full bg-gray-200/50 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
            style={{
              width: `${
                (completedSteps.length / WORKFLOW_STEPS.length) * 100
              }%`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowSteps;
