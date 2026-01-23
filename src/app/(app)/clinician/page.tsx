"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Patient, IDENTIFICATION_TYPES } from "@/services/apiPatient";
import { useRegisterPatient } from "@/features/patients/useRegisterPatient";
import { usePatients } from "@/features/patients/usePatients";
import { useCurrentFacility, useCurrentUser } from "@/hooks/useAuth";
import { useServicesByFacilityId } from "@/features/services/useServicesByFacilityCode";
import { useCreateBooking } from "@/features/services/bookings/useCreateBooking";
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
  FaCalendar,
  FaClock,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Modal from "@/components/common/Modal";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { maskPhoneNumber } from "@/lib/maskUtils";
import type { FlattenedContractService } from "@/types/contract";

export default function ClinicianServicesPage() {
  const { registerPatients, isRegistering } = useRegisterPatient();
  const { patients } = usePatients({});
  const facility = useCurrentFacility();
  const currentUser = useCurrentUser();
  const { createBooking, isCreating } = useCreateBooking();
  const router = useRouter();

  // Get facility ID for fetching contracts
  const facilityId = facility?.id || "";

  // Fetch contracts based on facility ID
  const { contracts, flattenedServices, isServicesLoading } =
    useServicesByFacilityId(facilityId);

  const [searchTerm, setSearchTerm] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  // Booking date/time state - per service
  const [serviceDates, setServiceDates] = useState<Record<string, Date>>({});
  const [serviceTimes, setServiceTimes] = useState<Record<string, string>>({});

  // Registration form state
  const [identificationType, setIdentificationType] = useState<string>(
    IDENTIFICATION_TYPES[0],
  );
  const [identificationNumber, setIdentificationNumber] = useState("");

  // Patient search state for SearchableSelect
  const [patientSearch, setPatientSearch] = useState("");

  // Initialize contract selection when contracts load
  useEffect(() => {
    if (!selectedContractId && contracts && contracts.length > 0) {
      setSelectedContractId(contracts[0].id);
    }
  }, [selectedContractId, contracts]);

  const handleServiceClick = (contractId: string) => {
    setSelectedContractId(contractId);
  };

  const handleRegisterPatient = (
    e: React.FormEvent,
    onCloseModal?: () => void,
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
      },
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

  // Handle service toggle
  const handleServiceToggle = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        // Remove service and its date/time
        const newIds = prev.filter((id) => id !== serviceId);
        const newDates = { ...serviceDates };
        const newTimes = { ...serviceTimes };
        delete newDates[serviceId];
        delete newTimes[serviceId];
        setServiceDates(newDates);
        setServiceTimes(newTimes);
        return newIds;
      } else {
        // Add service with default time
        setServiceTimes((prev) => ({ ...prev, [serviceId]: "09:00" }));
        return [...prev, serviceId];
      }
    });
  };

  // Handle booking submission
  const handleCreateBooking = () => {
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    // Check if all services have dates and times
    const missingDates = selectedServices.filter(
      (service) => !serviceDates[service.service_id],
    );

    if (missingDates.length > 0) {
      toast.error("Please set appointment date and time for all services");
      return;
    }

    // Create booking payload with per-service dates
    const bookingData = {
      facility_id: facilityId,
      patient_id: selectedPatient.id,
      override: false,
      services: selectedServices.map((service) => {
        const date = serviceDates[service.service_id];
        const time = serviceTimes[service.service_id] || "09:00";
        const [hours, minutes] = time.split(":");
        const bookingDateTime = new Date(date);
        bookingDateTime.setHours(parseInt(hours), parseInt(minutes));

        // Format as "YYYY-MM-DD HH:mm"
        const year = bookingDateTime.getFullYear();
        const month = String(bookingDateTime.getMonth() + 1).padStart(2, "0");
        const day = String(bookingDateTime.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day} ${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;

        return {
          contract_service_id: service.id, // Use the contract service item ID
          practitioner_id: currentUser?.id || "",
          scheduled_date: formattedDate,
        };
      }),
    };

    createBooking(bookingData, {
      onSuccess: (response: any) => {
        toast.success("Booking created successfully!");
        // Navigate to consent verification page with booking data
        // Support both new API (data.session_id) and legacy API (booking.booking_number)
        const data = response.data || response;
        const bookingInfo = {
          session_id: data.session_id || "",
          booking_number: data.booking?.booking_number || response.booking?.booking_number || "",
          patient_name: data.patient?.name || selectedPatient.name,
          patient_phone: data.phone || selectedPatient.phone,
          consent_id: data.consent_id || response.consent_id || "",
          expires_at: data.expires_at || response.expires_at || "",
          otp_message: data.otp_message || response.otp_message || response.message || "",
        };

        // Store in sessionStorage to pass to next page
        sessionStorage.setItem("pendingBooking", JSON.stringify(bookingInfo));

        // Navigate to consent page
        router.push("/clinician/consent");
      },
      onError: () => {
        toast.error("Failed to create booking");
      },
    });
  };

  // Get selected contract and its services (flattened for display)
  const selectedContract = contracts?.find((c) => c.id === selectedContractId);
  const availableServices: FlattenedContractService[] = selectedContract
    ? flattenedServices.filter(
        (s) => s.contract_id === selectedContractId && s.is_active
      )
    : [];

  // Get selected services with their details
  const selectedServices = availableServices.filter((service) =>
    selectedServiceIds.includes(service.service_id)
  );

  // Calculate total cost from actual service rates
  const totalCost = selectedServices.reduce((sum, service) => {
    const shaRate = parseFloat(service.sha_rate || "0");
    return sum + shaRate;
  }, 0);

  // Calculate facility and vendor shares (not in new API, set to 0)
  const facilityShare = 0;
  const vendorShare = 0;

  const isLoading = isServicesLoading;

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

          {/* Service Categories/Contracts */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Dynamic Contract Cards */}
              {contracts?.map((contract) => {
                // Get first lot name from services
                const lotName =
                  contract.services[0]?.lot?.name || "Service Category";
                return (
                  <button
                    key={contract.id}
                    onClick={() => handleServiceClick(contract.id)}
                    className={`bg-white rounded-lg p-2 hover:shadow-lg transition-shadow border-2 text-left ${
                      selectedContractId === contract.id
                        ? "border-blue-600 shadow-lg"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-gray-400"
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
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {lotName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {contract.services_count} services available
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Available Services from Selected Contract */}
            {selectedContract && availableServices.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Available Services in{" "}
                  {selectedContract.services[0]?.lot?.name || "Selected Category"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableServices.map((service) => (
                    <div
                      key={service.service_id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedServiceIds.includes(service.service_id)
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <button
                        onClick={() => handleServiceToggle(service.service_id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {service.service_name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Code: {service.service_code}
                            </p>
                          </div>
                          {selectedServiceIds.includes(service.service_id) && (
                            <FaCheckCircle className="w-5 h-5 text-green-600 ml-2" />
                          )}
                        </div>
                      </button>

                      {/* Date and Time Picker - shown when service is selected */}
                      {selectedServiceIds.includes(service.service_id) && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <div className="text-xs font-medium text-gray-700 mb-2">
                            Appointment Schedule
                          </div>

                          <Modal.Open
                            opens={`date-picker-${service.service_id}`}
                          >
                            <button className="w-full mb-2 px-2 py-1.5 border border-gray-300 rounded text-left hover:border-blue-500 transition-colors bg-white">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-700">
                                  {serviceDates[service.service_id]
                                    ? serviceDates[
                                        service.service_id
                                      ].toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })
                                    : "Select date"}
                                </span>
                                <FaCalendar className="w-3 h-3 text-gray-400" />
                              </div>
                            </button>
                          </Modal.Open>

                          <div className="flex items-center gap-2">
                            <FaClock className="w-3 h-3 text-gray-600" />
                            <input
                              type="time"
                              value={
                                serviceTimes[service.service_id] || "09:00"
                              }
                              onChange={(e) =>
                                setServiceTimes((prev) => ({
                                  ...prev,
                                  [service.service_id]: e.target.value,
                                }))
                              }
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            <SearchableSelect
              label=""
              options={
                patients?.map((p) => ({
                  value: p.id,
                  label: p.name,
                  description: p.phone ? maskPhoneNumber(p.phone) : p.identification_no || undefined,
                })) || []
              }
              value={selectedPatient?.id || ""}
              onChange={(value) => {
                const patient = patients?.find((p) => p.id === value);
                setSelectedPatient(patient || null);
              }}
              placeholder="Search and select a patient..."
              searchPlaceholder="Type patient name or ID..."
              onSearchChange={setPatientSearch}
            />
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
                    {selectedPatient.phone
                      ? maskPhoneNumber(selectedPatient.phone)
                      : "N/A"}
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

            {selectedServices.length > 0 ? (
              <div className="space-y-2">
                {selectedServices.map((service) => (
                  <div
                    key={service.service_id}
                    className="flex items-center justify-between bg-green-50 rounded p-2 text-sm"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <FaCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-900 block truncate">
                          {service.service_name}
                        </span>
                        {serviceDates[service.service_id] && (
                          <span className="text-xs text-gray-600 block">
                            {serviceDates[
                              service.service_id
                            ].toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            at {serviceTimes[service.service_id] || "09:00"}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900 ml-2">
                      KES {parseFloat(service.sha_rate || "0").toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
                <p>No services selected</p>
                <p className="text-xs mt-1">
                  Select services from the list above
                </p>
              </div>
            )}
          </div>{" "}
          {/* Equipment Information */}
          {selectedServices.length > 0 &&
            selectedServices.some((s) => s.equipment) && (
              <div className="px-4 py-3 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Equipment Information
                </h4>
                <div className="space-y-2">
                  {selectedServices
                    .filter((service) => service.equipment)
                    .map((service) => (
                      <div
                        key={service.service_id}
                        className="bg-blue-50 rounded-lg p-3 border border-blue-200"
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {service.equipment?.name}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              Serial: {service.equipment?.serial_number}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-700">
                                For: {service.service_name}
                              </span>
                              {service.equipment?.status && (
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded ${
                                    service.equipment.status === "available"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {service.equipment.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
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
                  <span className="font-semibold">
                    KES {facilityShare.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vendor Share</span>
                  <span className="font-semibold">
                    KES {vendorShare.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            {/* Total Cost */}
            <div className="bg-gray-900 text-white rounded-lg p-3 mb-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">SHA Rate (Total)</span>
                <span className="text-xl font-bold">
                  KES {totalCost.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Create Booking Button */}
            <button
              onClick={handleCreateBooking}
              disabled={
                !selectedPatient ||
                selectedServices.length === 0 ||
                selectedServices.some(
                  (service) => !serviceDates[service.service_id],
                ) ||
                isCreating
              }
              className="w-full bg-blue-800 hover:bg-blue-900 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Booking...</span>
                </>
              ) : (
                <>
                  <FaShoppingCart className="w-5 h-5" />
                  <span>Create Booking</span>
                </>
              )}
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

      {/* Date Picker Modals - one for each service */}
      {selectedServices.map((service) => (
        <Modal.Window
          key={service.service_id}
          name={`date-picker-${service.service_id}`}
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Select Appointment Date
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              for <span className="font-semibold">{service.service_name}</span>
            </p>
            <div className="flex justify-center">
              <DayPicker
                mode="single"
                selected={serviceDates[service.service_id]}
                onSelect={(date) => {
                  if (date) {
                    setServiceDates((prev) => ({
                      ...prev,
                      [service.service_id]: date,
                    }));
                  }
                }}
                disabled={{ before: new Date() }}
                className="border rounded-lg p-4"
              />
            </div>
          </div>
        </Modal.Window>
      ))}
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
