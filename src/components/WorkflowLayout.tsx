"use client";

import React from "react";
import WorkflowSteps from "./WorkflowSteps";
import { useWorkflowProgress } from "@/hooks/useWorkflowProgress";
import { FaHeartbeat, FaStar } from "react-icons/fa";

interface WorkflowLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showFullProgress?: boolean;
  currentPhase?: "registration" | "service" | "fulfillment";
}

const WorkflowLayout: React.FC<WorkflowLayoutProps> = ({
  children,
  title,
  subtitle,
  showFullProgress = false,
  currentPhase,
}) => {
  const { currentStep, completedSteps, progress } = useWorkflowProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-red-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse delay-1500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        {/* Header with Progress */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
            <FaStar className="text-purple-500 animate-pulse" />
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Healthcare Workflow
            </span>
            <FaHeartbeat className="text-red-500 animate-pulse" />
          </div>

          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Progress Display */}
          <WorkflowSteps
            currentStep={currentStep}
            completedSteps={completedSteps}
            variant="mini"
            className="mt-6"
          />
          
          <div className="mt-4 text-sm text-gray-600">
            Overall Progress: {progress.overall}% 
            {currentPhase && ` • ${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}: ${progress[currentPhase]}%`}
          </div>
        </div>

        {/* Optional Full Progress Display */}
        {showFullProgress && (
          <WorkflowSteps
            currentStep={currentStep}
            completedSteps={completedSteps}
            variant="full"
            className="mb-12"
          />
        )}

        {/* Phase-specific Progress */}
        {currentPhase && (
          <WorkflowSteps
            currentStep={currentStep}
            completedSteps={completedSteps}
            variant="category"
            showCategory={currentPhase}
            className="mb-12"
          />
        )}

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
};

export default WorkflowLayout;