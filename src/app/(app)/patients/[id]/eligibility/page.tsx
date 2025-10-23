"use client";
import { useState } from "react";
import BackButton from "@/components/common/BackButton";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { usePatient } from "@/features/patients/usePatient";
import { useParams, useRouter } from "next/navigation";
import {
  FaUser,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaCalendar,
  FaUserFriends,
} from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import {
  checkContributorEligibility,
  checkDependantEligibility,
  ContributorEligibilityRequest,
  DependantEligibilityRequest,
  EligibilityResponse,
} from "@/services/apiEligibility";
import toast from "react-hot-toast";
import { IDENTIFICATION_TYPES as PATIENT_ID_TYPES } from "@/services/apiPatient";

export default function PatientEligibilityPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { patient, isLoading: isLoadingPatient } = usePatient(params.id);

  const [checkType, setCheckType] = useState<"contributor" | "dependant">(
    "contributor"
  );
  const [eligibilityResult, setEligibilityResult] =
    useState<EligibilityResponse | null>(null);

  // Contributor form state
  const [contributorData, setContributorData] =
    useState<ContributorEligibilityRequest>({
      identificationType: patient?.identification_type || "National ID",
      identificationNumber: patient?.identification_no || "",
    });

  // Dependant form state
  const [dependantData, setDependantData] =
    useState<DependantEligibilityRequest>({
      identificationType: "Birth Certificate",
      identificationNumber: "",
      parentIdentificationType: "National ID",
      parentIdentificationNumber: "",
    });

  // Contributor eligibility mutation
  const contributorMutation = useMutation<
    EligibilityResponse,
    Error,
    ContributorEligibilityRequest
  >({
    mutationFn: checkContributorEligibility,
    onSuccess: (data) => {
      setEligibilityResult(data);
      if (data.eligible) {
        toast.success("Eligibility check completed successfully");
      } else {
        toast.error("Not eligible for coverage");
      }
    },
    onError: (error) => {
      toast.error(`Eligibility check failed: ${error.message}`);
      setEligibilityResult(null);
    },
  });

  // Dependant eligibility mutation
  const dependantMutation = useMutation<
    EligibilityResponse,
    Error,
    DependantEligibilityRequest
  >({
    mutationFn: checkDependantEligibility,
    onSuccess: (data) => {
      setEligibilityResult(data);
      if (data.eligible) {
        toast.success("Eligibility check completed successfully");
      } else {
        toast.error("Not eligible for coverage");
      }
    },
    onError: (error) => {
      toast.error(`Eligibility check failed: ${error.message}`);
      setEligibilityResult(null);
    },
  });

  const handleContributorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEligibilityResult(null);
    contributorMutation.mutate(contributorData);
  };

  const handleDependantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEligibilityResult(null);
    dependantMutation.mutate(dependantData);
  };

  const isChecking =
    contributorMutation.isPending || dependantMutation.isPending;

  // Pre-fill contributor data when patient loads
  useState(() => {
    if (patient && !contributorData.identificationNumber) {
      setContributorData({
        identificationType: patient.identification_type || "National ID",
        identificationNumber: patient.identification_no || "",
      });
    }
  });

  if (isLoadingPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          <BackButton onClick={() => router.back()} />
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading patient details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGate permission={Permission.GET_PATIENT_FROM_REGISTRY}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <BackButton onClick={() => router.back()} />

          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaUser className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  SHA Eligibility Check
                </h1>
                <p className="text-sm text-gray-600">
                  Patient: {patient?.name || "Unknown"}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Check eligibility for SHA coverage as a contributor or dependant
            </p>
          </div>

          {/* Check Type Selector */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Check Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setCheckType("contributor");
                  setEligibilityResult(null);
                }}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  checkType === "contributor"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FaUser className="w-4 h-4" />
                  <span className="font-medium">Contributor</span>
                </div>
                <p className="text-xs mt-1">Primary member/contributor</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCheckType("dependant");
                  setEligibilityResult(null);
                }}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  checkType === "dependant"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FaUserFriends className="w-4 h-4" />
                  <span className="font-medium">Dependant</span>
                </div>
                <p className="text-xs mt-1">Child or dependent member</p>
              </button>
            </div>
          </div>

          {/* Contributor Form */}
          {checkType === "contributor" && (
            <form onSubmit={handleContributorSubmit} className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaUser className="w-5 h-5 text-blue-600" />
                  Contributor Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Identification Type
                    </label>
                    <select
                      value={contributorData.identificationType}
                      onChange={(e) =>
                        setContributorData({
                          ...contributorData,
                          identificationType: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {PATIENT_ID_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Identification Number
                    </label>
                    <input
                      type="text"
                      value={contributorData.identificationNumber}
                      onChange={(e) =>
                        setContributorData({
                          ...contributorData,
                          identificationNumber: e.target.value,
                        })
                      }
                      placeholder="Enter identification number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      minLength={5}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChecking}
                  className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  {isChecking ? (
                    <>
                      <FaSpinner className="w-5 h-5 animate-spin" />
                      Checking Eligibility...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="w-5 h-5" />
                      Check Eligibility
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Dependant Form */}
          {checkType === "dependant" && (
            <form onSubmit={handleDependantSubmit} className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaUserFriends className="w-5 h-5 text-blue-600" />
                  Dependant Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dependant Identification Type
                    </label>
                    <select
                      value={dependantData.identificationType}
                      onChange={(e) =>
                        setDependantData({
                          ...dependantData,
                          identificationType: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {PATIENT_ID_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dependant Identification Number
                    </label>
                    <input
                      type="text"
                      value={dependantData.identificationNumber}
                      onChange={(e) =>
                        setDependantData({
                          ...dependantData,
                          identificationNumber: e.target.value,
                        })
                      }
                      placeholder="Enter dependant identification number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      minLength={5}
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Parent/Guardian Details
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Parent Identification Type
                        </label>
                        <select
                          value={dependantData.parentIdentificationType}
                          onChange={(e) =>
                            setDependantData({
                              ...dependantData,
                              parentIdentificationType: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          {PATIENT_ID_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Parent Identification Number
                        </label>
                        <input
                          type="text"
                          value={dependantData.parentIdentificationNumber}
                          onChange={(e) =>
                            setDependantData({
                              ...dependantData,
                              parentIdentificationNumber: e.target.value,
                            })
                          }
                          placeholder="Enter parent identification number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          minLength={5}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChecking}
                  className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  {isChecking ? (
                    <>
                      <FaSpinner className="w-5 h-5 animate-spin" />
                      Checking Eligibility...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="w-5 h-5" />
                      Check Eligibility
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Eligibility Result */}
          {eligibilityResult && (
            <div
              className={`bg-white rounded-lg shadow-sm p-4 md:p-6 border-2 ${
                eligibilityResult.eligible
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              <div className="flex items-start gap-3">
                {eligibilityResult.eligible ? (
                  <FaCheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <FaExclamationTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h3
                    className={`text-lg font-bold mb-2 ${
                      eligibilityResult.eligible
                        ? "text-green-900"
                        : "text-red-900"
                    }`}
                  >
                    {eligibilityResult.eligible
                      ? "Eligible for Coverage"
                      : "Not Eligible for Coverage"}
                  </h3>
                  <p
                    className={`text-sm mb-3 ${
                      eligibilityResult.eligible
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {eligibilityResult.message}
                  </p>
                  {eligibilityResult.coverage_end_date && (
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        eligibilityResult.eligible
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      <FaCalendar className="w-4 h-4" />
                      <span>
                        Coverage valid until:{" "}
                        <strong>
                          {new Date(
                            eligibilityResult.coverage_end_date
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PermissionGate>
  );
}
