"use client";
import Pagination from "@/components/Pagination";
import LocationFilters from "@/components/LocationFilters";
import { usePatientsPaginated } from "@/features/patients/usePatients";
import { useBookings } from "@/features/services/bookings/useBookings";
import { useDebounce } from "@/hooks/useDebounce";
import { Patient } from "@/services/apiPatient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaCalendar,
  FaChevronRight,
  FaPhone,
  FaSearch,
  FaUser,
} from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";

function PatientBookingsModal({
  patient,
  isOpen,
  onClose,
}: {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { bookings, isLoading: _bookingsLoading } = useBookings();

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Patient Bookings
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <PatientBreadcrumb patient={patient} />

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Facility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Payment Mode
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      {booking.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      <div>
                        <div className="font-medium">
                          {booking.service?.service?.name || "N/A"}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {booking.service?.service?.code || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      <div>
                        <div className="font-medium">
                          {booking.service?.contract?.facility?.name || "N/A"}
                        </div>
                        <div className="text-gray-500 text-xs">
                          Code:{" "}
                          {booking.service?.contract?.facility?.code || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      {booking.booking_date
                        ? new Date(booking.booking_date).toLocaleString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          (booking.approval_status || booking.approval) ===
                          "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : (booking.approval_status || booking.approval) ===
                              "approved"
                            ? "bg-green-100 text-green-800"
                            : (booking.approval_status || booking.approval) ===
                              "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {(
                          booking.approval_status ||
                          booking.approval ||
                          "pending"
                        )
                          .charAt(0)
                          .toUpperCase() +
                          (
                            booking.approval_status ||
                            booking.approval ||
                            "pending"
                          ).slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      KES{" "}
                      {booking.vendor_share
                        ? parseInt(booking.vendor_share).toLocaleString()
                        : "0"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      {booking.payment_mode || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {bookings.length === 0 && (
            <div className="text-center py-8">
              <FaCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No bookings found for this patient
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Dropdown Menu Component
function ActionsDropdown({
  patient: _patient,
  onViewBookings,
}: {
  patient: Patient;
  onViewBookings: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <FiMoreVertical className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewBookings();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <FaCalendar className="w-4 h-4" />
              View Bookings
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Breadcrumb Component
function PatientBreadcrumb({ patient }: { patient: Patient }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center gap-2">
          <FaUser className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-900">{patient.name}</span>
        </div>
        <FaChevronRight className="w-4 h-4 text-gray-400" />
        <div className="flex items-center gap-2">
          <FaPhone className="w-4 h-4 text-green-600" />
          <span className="text-gray-600">{patient.phone}</span>
        </div>
        <FaChevronRight className="w-4 h-4 text-gray-400" />
        <div className="text-gray-600">ID: {patient.id.slice(-8)}</div>
      </div>
    </div>
  );
}

function Patients() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilters, setLocationFilters] = useState<{
    county_id?: string;
    sub_county_id?: string;
    ward_id?: string;
    facility_id?: string;
  }>({});
  const [_selectedPatient, _setSelectedPatient] = useState<Patient | null>(
    null
  );
  const [_showBookingsModal, _setShowBookingsModal] = useState(false);
  const router = useRouter();

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, searchTerm]);

  // Use paginated patients hook with search
  const { isLoading, patients, pagination, error } = usePatientsPaginated({
    page: currentPage,
    per_page: 100, // Match the API response
    search: debouncedSearchTerm || undefined, // Only include search if there's a term
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Reset to page 1 immediately when user starts typing
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // const handlePatientClick = (patient: Patient) => {
  //   setSelectedPatient(patient);
  //   setShowBookingsModal(true);
  // };

  // const handleViewBookings = (patient: Patient) => {
  //   setSelectedPatient(patient);
  //   setShowBookingsModal(true);
  // };

  const handlePatientClick = (patient: Patient) => {
    router.push(`/patients/${patient.id}/bookings`);
  };

  const handleViewBookings = (patient: Patient) => {
    router.push(`/patients/${patient.id}/bookings`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">⚠️</div>
          <p className="text-red-600">
            Error loading patients: {error?.message || "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  const patientData = patients ?? [];
  const totalPatients = pagination?.total ?? patientData.length;

  // Show loading state or search results info
  const showEmptyState = !isLoading && patientData.length === 0;
  const isSearching = debouncedSearchTerm.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl mb-4 md:mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 md:px-8 py-4 md:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaUser className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                    Patient Management
                  </h1>
                  <p className="text-sm md:text-base text-blue-100">
                    Manage patient records and information
                    {pagination && (
                      <span className="ml-2 hidden sm:inline">
                        • Page {pagination.currentPage} of {pagination.lastPage}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 md:p-6 bg-gray-50 border-b space-y-4">
            {/* Location Filters */}
            <LocationFilters
              onLocationChange={setLocationFilters}
              showFacilityFilter={true}
            />

            {/* Search Input */}
            <div className="relative max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients by name, phone..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              />
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaUser className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  {totalPatients}
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Total Patients
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaCalendar className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  --
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Active Bookings
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FaPhone className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  --
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Recent Contacts
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl hidden md:block">
          {showEmptyState ? (
            <div className="p-12 text-center">
              <div className="text-gray-500 text-xl mb-4">
                {isSearching
                  ? "No patients match your search"
                  : "No patients found"}
              </div>
              <p className="text-gray-400">
                {isSearching
                  ? "Try adjusting your search terms"
                  : "Patients will appear here once they are registered"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Contact Info
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Date of Birth
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      SHA Number
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Registration Date
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patientData.map((patient: Patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handlePatientClick(patient)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FaUser className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {patient.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {patient.id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaPhone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{patient.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(patient.date_of_birth).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {patient.sha_number ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {patient.sha_number}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">No SHA</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(patient.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ActionsDropdown
                          patient={patient}
                          onViewBookings={() => handleViewBookings(patient)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.lastPage > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              lastPage={pagination.lastPage}
              total={pagination.total}
              from={pagination.from}
              to={pagination.to}
              links={pagination.links}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {showEmptyState ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
              {isSearching
                ? "No patients match your search"
                : "No patients found"}
              <p className="text-gray-400 mt-2">
                {isSearching
                  ? "Try adjusting your search terms"
                  : "Patients will appear here once they are registered"}
              </p>
            </div>
          ) : (
            <>
              {patientData.map((patient: Patient) => (
                <div
                  key={patient.id}
                  className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 cursor-pointer"
                  onClick={() => handlePatientClick(patient)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaUser className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {patient.name}
                        </h3>
                        <div className="text-sm text-gray-500">
                          ID: {patient.id.slice(-8)}
                        </div>
                      </div>
                    </div>
                    <ActionsDropdown
                      patient={patient}
                      onViewBookings={() => handleViewBookings(patient)}
                    />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FaPhone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{patient.phone}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-500 font-medium">
                          Date of Birth:
                        </span>
                        <p className="text-gray-900">
                          {new Date(patient.date_of_birth).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">
                          Registered:
                        </span>
                        <p className="text-gray-900">
                          {new Date(patient.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    {patient.sha_number ? (
                      <div>
                        <span className="text-gray-500 font-medium">
                          SHA Number:
                        </span>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {patient.sha_number}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-gray-500 font-medium">
                          SHA Number:
                        </span>
                        <p className="text-gray-400">No SHA</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Mobile Pagination */}
              {pagination && pagination.lastPage > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={pagination.currentPage}
                    lastPage={pagination.lastPage}
                    total={pagination.total}
                    from={pagination.from}
                    to={pagination.to}
                    links={pagination.links}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Patients;
