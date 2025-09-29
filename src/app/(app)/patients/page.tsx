"use client";
import Pagination from "@/components/Pagination";
import { usePatientsPaginated } from "@/features/patients/usePatients";
import { useDebounce } from "@/hooks/useDebounce";
import { Patient } from "@/services/apiPatient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCalendar, FaPhone, FaSearch, FaUser } from "react-icons/fa";
import { ActionMenu } from "@/components/ActionMenu";

// Removed unused PatientBookingsModal

// Removed ActionsDropdown component - replaced with ActionMenu

// Breadcrumb Component
// Removed PatientBreadcrumb (unused)

function Patients() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  // Removed unused modal-related state
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
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl mb-4 md:mb-6 overflow-visible">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 md:px-8 py-4 md:py-6 rounded-t-xl md:rounded-t-2xl">
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
          <div className="p-4 md:p-6 bg-gray-50 border-b space-y-4 overflow-visible">
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
                        <ActionMenu menuId={`patient-${patient.id}`}>
                          <ActionMenu.Trigger />
                          <ActionMenu.Content>
                            <ActionMenu.Item
                              onClick={() => handleViewBookings(patient)}
                            >
                              <FaCalendar className="w-4 h-4" /> View Bookings
                            </ActionMenu.Item>
                          </ActionMenu.Content>
                        </ActionMenu>
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
                    <ActionMenu menuId={`patient-mobile-${patient.id}`}>
                      <ActionMenu.Trigger />
                      <ActionMenu.Content>
                        <ActionMenu.Item
                          onClick={() => handleViewBookings(patient)}
                        >
                          <FaCalendar className="w-4 h-4" /> View Bookings
                        </ActionMenu.Item>
                      </ActionMenu.Content>
                    </ActionMenu>
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
