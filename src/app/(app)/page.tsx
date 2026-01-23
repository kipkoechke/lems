"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUserWithLoading } from "@/hooks/useAuth";
import { RoleBasedDashboard } from "@/components/RoleBasedDashboard";
import UserInfo from "@/components/UserInfo";
import ProceedToTests from "@/components/ProceedToTests";
import ServiceInProgress from "@/components/ServiceInProgress";
import {
  goToNextStep,
  selectFacility,
  selectPaymentMode,
  setPatient,
} from "@/context/workflowSlice";
import PatientConsent from "@/features/patients/PatientConsent";
import PatientRegistration from "@/features/patients/PatientRegistration";
import ServiceFulfillment from "@/features/services/fulfillments/ServiceFulfillment";
import ServiceRecommendation from "@/features/services/recommendations/ServiceRecommendation";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { Facility } from "@/services/apiFacility";
import { Patient } from "@/services/apiPatient";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUserWithLoading();
  const { currentStep } = useAppSelector((store) => store.workflow);
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log("Current workflow step:", currentStep);
  }, [currentStep]);

  useEffect(() => {
    if (user && user.role === "f_practitioner") {
      // Clinicians go directly to clinician services page
      router.replace("/clinician");
    } else if (user && user.role === "f_equipment_user") {
      // Lab staff go directly to lab services page
      router.replace("/lab");
    } else if (user && user.role === "f_finance") {
      // Finance staff go directly to finance approval page
      router.replace("/finance");
    }
    // Vendor and Facility Admin stay on dashboard - no redirect needed
  }, [user, router]);

  // Show loading while user data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, middleware will redirect
  if (!user) {
    return null;
  }

  // If f_practitioner or f_equipment_user, show loading while redirecting
  if (user.role === "f_practitioner" || user.role === "f_equipment_user") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to services...</p>
        </div>
      </div>
    );
  }

  // For vendor users, show only the dashboard (no workflow)
  if (user.role === "vendor") {
    return (
      <div className="container mx-auto p-2 md:px-6 md:py-2">
        <UserInfo />
        <div className="mt-6">
          <RoleBasedDashboard />
        </div>
      </div>
    );
  }

  // For facility admin, show dashboard without workflow
  if (user.role === "f_admin") {
    return (
      <div className="container mx-auto p-2 md:px-6 md:py-2">
        <UserInfo />
        <div className="mt-6">
          <RoleBasedDashboard />
        </div>
      </div>
    );
  }

  // Handler for PatientRegistration step completion
  const handleStepOneComplete = (
    patient: Patient,
    paymentModeId: string,
    facility: Facility,
  ) => {
    console.log("handleStepOneComplete called with:", {
      patient,
      paymentModeId,
      facility,
    });

    // Dispatch all the data to workflow state
    dispatch(setPatient(patient));

    // Create hardcoded payment mode object
    const paymentModeMap: Record<string, any> = {
      sha: { paymentModeId: "sha", paymentModeName: "SHA" },
      cash: { paymentModeId: "cash", paymentModeName: "CASH" },
      other_insurances: {
        paymentModeId: "other_insurances",
        paymentModeName: "OTHER INSURANCES",
      },
    };
    const paymentMode = paymentModeMap[paymentModeId];

    console.log("Dispatching:", { paymentMode, facility });

    dispatch(selectPaymentMode(paymentMode));
    dispatch(selectFacility(facility));
    dispatch(goToNextStep());
  };

  const renderStepComponent = () => {
    switch (currentStep) {
      case "registration":
        return (
          <PatientRegistration onStepOneComplete={handleStepOneComplete} />
        );
      case "recommendation":
        return <ServiceRecommendation />;
      case "consent":
        return <PatientConsent />;
      case "proceedToTests":
        return <ProceedToTests />;
      case "serviceInProgress":
        return <ServiceInProgress />;
      case "fulfillment":
        return <ServiceFulfillment />;
      default:
        return <div>Step not implemented.</div>;
    }
  };

  // For other roles, show the original workflow
  return (
    <div className="container mx-auto p-2 md:px-6 md:py-2">
      <UserInfo />
      <div className="mt-6">
        <RoleBasedDashboard />
      </div>
      <div className="mt-8">{renderStepComponent()}</div>
    </div>
  );
}
