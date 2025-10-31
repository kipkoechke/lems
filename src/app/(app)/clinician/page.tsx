"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLots } from "@/features/lots/useLots";
import { Lot } from "@/services/apiLots";
import { Patient, IDENTIFICATION_TYPES } from "@/services/apiPatient";
import { useRegisterPatient } from "@/features/patients/useRegisterPatient";
import { usePatients } from "@/features/patients/usePatients";
import {
  FaSearch,
  FaMicrophone,
  FaHeart,
  FaUser,
  FaUserPlus,
  FaCamera,
  FaShoppingCart,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Modal from "@/components/common/Modal";

export default function ClinicianServicesPage() {
  const router = useRouter();
  const { lots, isLoading } = useLots();
  const { registerPatients, isRegistering } = useRegisterPatient();
  const { patients } = usePatients({});

  const [searchTerm, setSearchTerm] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Registration form state
  const [identificationType, setIdentificationType] = useState<string>(
    IDENTIFICATION_TYPES[0]
  );
  const [identificationNumber, setIdentificationNumber] = useState("");

  // Mock services - replace with actual service selection
  const mockServices = [
    { name: "Diagnostic Imaging CT", cost: 11200 },
    { name: "Diagnostic Imaging MRI", cost: 11200 },
    { name: "Diagnostic Imaging Sonography", cost: 11200 },
  ];

  // Auto-select first patient if available and none selected
  useEffect(() => {
    if (patients && patients.length > 0 && !selectedPatient) {
      setSelectedPatient(patients[0]);
    }
  }, [patients, selectedPatient]);

  const handleServiceClick = (lot: Lot) => {
    router.push(`/lots/${lot.id}/services`);
  };

  const handleRegisterPatient = (
    e: React.FormEvent,
    onCloseModal?: () => void
  ) => {
    e.preventDefault();

    if (!identificationNumber.trim()) {
      toast.error("Please enter identification number");
      return;
    }

    registerPatients(
      {
        identificationType,
        identificationNumber: identificationNumber.trim(),
      },
      {
        onSuccess: (patient) => {
          toast.success("Patient registered successfully");
          setSelectedPatient(patient);
          setIdentificationNumber("");
          if (onCloseModal) onCloseModal();
        },
      }
    );
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Modal>
      <div className="h-full flex bg-gray-50">
        {/* Services Section */}
        <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden h-full">
          {/* Services Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Services</h2>
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  showFavorites
                    ? "bg-green-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700"
                }`}
              >
                <FaHeart className="w-4 h-4" />
                <span className="text-sm font-medium">Favorites</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaMicrophone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Service Categories/Lots */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* All Lots Card */}
              <button
                onClick={() => router.push("/lots/all")}
                className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-200 text-left"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">All Lots</h3>
              </button>

              {/* Dynamic Lot Cards */}
              {lots?.map((lot) => (
                <button
                  key={lot.id}
                  onClick={() => handleServiceClick(lot)}
                  className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-200 text-left"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">{lot.name}</h3>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Patient Information Sidebar */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto self-start">
          {/* Patient Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaUser className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">
                  Patient Information
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Modal.Open opens="register-patient">
                  <button className="w-8 h-8 bg-green-600 text-white rounded flex items-center justify-center hover:bg-green-700">
                    <FaUserPlus className="w-4 h-4" />
                  </button>
                </Modal.Open>
                <button className="w-8 h-8 bg-orange-500 text-white rounded flex items-center justify-center hover:bg-orange-600">
                  <FaCamera className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600">
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Patient Selector */}
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm"
              value={selectedPatient?.id || ""}
              onChange={(e) => {
                const patient = patients?.find((p) => p.id === e.target.value);
                if (patient) setSelectedPatient(patient);
              }}
            >
              {!selectedPatient && <option value="">Select a patient</option>}
              {patients?.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Details */}
          <div className="px-4 py-3 border-b border-gray-200 text-sm">
            {selectedPatient ? (
              <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
                <p className="text-gray-900 font-semibold mb-1">
                  {selectedPatient.name}
                </p>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-medium">
                    {selectedPatient.date_of_birth
                      ? calculateAge(selectedPatient.date_of_birth)
                      : "N/A"}{" "}
                    Years
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedPatient.phone || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">CR NO:</span>{" "}
                    {selectedPatient.cr_no || "N/A"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 mb-3 text-center text-gray-500">
                <p className="text-sm">No patient selected</p>
                <Modal.Open opens="register-patient">
                  <button className="mt-2 text-blue-600 hover:text-blue-800 text-xs">
                    Register a new patient
                  </button>
                </Modal.Open>
              </div>
            )}
          </div>

          {/* Selected Services */}
          <div className="px-4 py-3">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Selected Service(s)
                <span className="float-right">COST</span>
              </h4>
            </div>

            <div className="space-y-2">
              {mockServices.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-green-50 rounded p-2 text-sm"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <FaCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-900">{service.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    KES {service.cost.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Identification Section */}
          <div className="px-4 py-3 border-t border-gray-200">
            {selectedPatient && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-700">
                      Identifier:
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                      {selectedPatient.identification_type || "N/A"}
                    </span>
                    <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                      Eligible
                    </span>
                  </div>
                </div>
                <div className="text-xs">
                  <span className="font-medium">Identification No.</span>{" "}
                  {selectedPatient.identification_no || "N/A"}
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                Payment Summary
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Facility Share</span>
                  <span className="font-semibold">KES 3,600</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vendor Share</span>
                  <span className="font-semibold">KES 30,000</span>
                </div>
              </div>
            </div>

            {/* Total Cost */}
            <div className="bg-gray-900 text-white rounded-lg p-3 mb-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Cost</span>
                <span className="text-xl font-bold">KES 33,600</span>
              </div>
            </div>

            {/* Send to Fiance Button */}
            <button className="w-full bg-blue-800 hover:bg-blue-900 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2">
              <FaShoppingCart className="w-5 h-5" />
              <span>Send to Fiance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Registration Modal */}
      <Modal.Window name="register-patient">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Register New Patient
          </h3>

          <RegistrationForm
            identificationType={identificationType}
            setIdentificationType={setIdentificationType}
            identificationNumber={identificationNumber}
            setIdentificationNumber={setIdentificationNumber}
            isRegistering={isRegistering}
            onSubmit={handleRegisterPatient}
          />
        </div>
      </Modal.Window>
    </Modal>
  );
}

// Registration Form Component
interface RegistrationFormProps {
  identificationType: string;
  setIdentificationType: (value: string) => void;
  identificationNumber: string;
  setIdentificationNumber: (value: string) => void;
  isRegistering: boolean;
  onSubmit: (e: React.FormEvent, onCloseModal?: () => void) => void;
  onCloseModal?: () => void;
}

function RegistrationForm({
  identificationType,
  setIdentificationType,
  identificationNumber,
  setIdentificationNumber,
  isRegistering,
  onSubmit,
  onCloseModal,
}: RegistrationFormProps) {
  return (
    <form onSubmit={(e) => onSubmit(e, onCloseModal)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Identification Type
        </label>
        <select
          value={identificationType}
          onChange={(e) => setIdentificationType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {IDENTIFICATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Identification Number
        </label>
        <input
          type="text"
          value={identificationNumber}
          onChange={(e) => setIdentificationNumber(e.target.value)}
          placeholder="Enter identification number"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={isRegistering}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRegistering ? "Registering..." : "Register"}
        </button>
      </div>
    </form>
  );
}
