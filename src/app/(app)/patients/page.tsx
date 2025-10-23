"use client";
import Pagination from "@/components/common/Pagination";
import { usePatientsPaginated } from "@/features/patients/usePatients";
import { useDebounce } from "@/hooks/useDebounce";
import { Patient } from "@/services/apiPatient";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  FaSearch,
  FaUsers,
  FaUserCheck,
  FaClock,
  FaExclamationTriangle,
  FaFileExport,
  FaUserPlus,
} from "react-icons/fa";
import { FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { Table } from "@/components/Table";
import {
  maskReferenceNumber,
  maskPhoneNumber,
  maskEmail,
} from "@/lib/maskUtils";
import { formatDateOnlyNairobi } from "@/lib/dateUtils";
import { ActionMenu } from "@/components/common/ActionMenu";

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

  // Calculate statistics from patient data
  const stats = useMemo(() => {
    const patientData = patients ?? [];
    const totalPatients = pagination?.total ?? 0;

    // Calculate active patients (patients with recent activity - last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activePatients = patientData.filter((patient) => {
      const updatedDate = new Date(patient.updated_at);
      return updatedDate >= thirtyDaysAgo;
    }).length;

    // Calculate pending (patients without SHA numbers)
    const pendingPatients = patientData.filter(
      (patient) => !patient.sha_number
    ).length;

    // For display purposes, scale up the counts if we're on page 1
    // to better represent the total data
    const scaleFactor =
      currentPage === 1 && totalPatients > 100 ? totalPatients / 100 : 1;

    return {
      total: totalPatients,
      active: Math.round(activePatients * scaleFactor),
      pending: Math.round(pendingPatients * scaleFactor),
      highPriority: Math.round(pendingPatients * 0.5 * scaleFactor), // Estimate high priority as 50% of pending
    };
  }, [patients, pagination, currentPage]);

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

  // Show loading state or search results info
  const showEmptyState = !isLoading && patientData.length === 0;
  const isSearching = debouncedSearchTerm.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Patients
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Manage and monitor patient records
              </p>
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 px-2 py-1 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm">
                <FaFileExport className="w-4 h-4" />
                <span className="font-medium">Export</span>
              </button>
              <button
                onClick={() => router.push("/patients/new")}
                className="inline-flex items-center gap-2 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <FaUserPlus className="w-4 h-4" />
                <span className="font-medium">Add Patient</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
          {/* Total Patients */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">
                  Total Patients
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <FaUsers className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Patients */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">
                  Active Patients
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                <FaUserCheck className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">
                  Pending
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
              <div className="w-9 h-9 bg-yellow-50 rounded-lg flex items-center justify-center">
                <FaClock className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* High Priority */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">
                  High Priority
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.highPriority}
                </p>
              </div>
              <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                <FaExclamationTriangle className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hidden md:block overflow-hidden">
          {/* Search and Filters in Table Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {/* Search Input */}
              <div className="relative w-64">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter and Sort Buttons */}
              <button className="inline-flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span className="font-medium">Filter</span>
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                <span className="font-medium">Sort</span>
              </button>

              {/* Results count */}
              <div className="ml-auto flex items-center gap-3">
                <p className="text-sm text-gray-600">
                  {stats.total} patients
                  {isSearching && ` matching "${debouncedSearchTerm}"`}
                </p>
                <button className="text-blue-600 hover:text-blue-700 inline-flex items-center">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

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
            <>
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </Table.HeaderCell>
                      <Table.HeaderCell>Patient</Table.HeaderCell>
                      <Table.HeaderCell>SHA No.</Table.HeaderCell>
                      <Table.HeaderCell>Age</Table.HeaderCell>
                      <Table.HeaderCell>Gender</Table.HeaderCell>
                      <Table.HeaderCell>Booking Date</Table.HeaderCell>
                      <Table.HeaderCell>Payment Status</Table.HeaderCell>
                      <Table.HeaderCell>Payment Mode</Table.HeaderCell>
                      <Table.HeaderCell align="center">
                        Actions
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {patientData.map((patient: Patient) => {
                      // Calculate age
                      const age = patient.date_of_birth
                        ? Math.floor(
                            (new Date().getTime() -
                              new Date(patient.date_of_birth).getTime()) /
                              (365.25 * 24 * 60 * 60 * 1000)
                          )
                        : null;

                      return (
                        <Table.Row
                          key={patient.id}
                          onClick={() => handlePatientClick(patient)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <Table.Cell>
                            <input
                              type="checkbox"
                              onClick={(e) => e.stopPropagation()}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <div>
                              <div className="font-medium text-gray-900">
                                {patient.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5 space-y-0.5">
                                {patient.phone && (
                                  <div>📞 {maskPhoneNumber(patient.phone)}</div>
                                )}
                                {patient.email && (
                                  <div>✉️ {maskEmail(patient.email)}</div>
                                )}
                              </div>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-gray-700">
                              {patient.sha_number
                                ? maskReferenceNumber(patient.sha_number)
                                : maskReferenceNumber(patient.id.slice(0, 16))}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-gray-700">
                              {age !== null ? age : "-"}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-gray-700">
                              {patient.gender || "-"}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-gray-700">
                              {formatDateOnlyNairobi(patient.created_at)}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                              Pending
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-gray-700">-</span>
                          </Table.Cell>
                          <Table.Cell align="center">
                            <ActionMenu menuId={`patient-${patient.id}`}>
                              <ActionMenu.Trigger />
                              <ActionMenu.Content>
                                <ActionMenu.Item
                                  onClick={() => {
                                    router.push(`/patients/${patient.id}`);
                                  }}
                                >
                                  <FiEye className="h-4 w-4" />
                                  View Details
                                </ActionMenu.Item>
                                <ActionMenu.Item
                                  onClick={() => {
                                    // Add edit functionality
                                    console.log("Edit patient:", patient.id);
                                  }}
                                >
                                  <FiEdit className="h-4 w-4" />
                                  Edit Patient
                                </ActionMenu.Item>
                                <ActionMenu.Item
                                  onClick={() => {
                                    // Add delete functionality
                                    console.log("Delete patient:", patient.id);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                >
                                  <FiTrash className="h-4 w-4" />
                                  Delete
                                </ActionMenu.Item>
                              </ActionMenu.Content>
                            </ActionMenu>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.lastPage > 1 && (
                <div className="border-t border-gray-200">
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

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {/* Mobile Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="space-y-3">
              {/* Search Input */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter and Sort Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  <span className="font-medium">Filter</span>
                </button>
                <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                  <span className="font-medium">Sort</span>
                </button>
              </div>

              {/* Results count */}
              <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
                <p>
                  {stats.total} patients
                  {isSearching && ` matching "${debouncedSearchTerm}"`}
                </p>
                <button className="text-blue-600 hover:text-blue-700">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {showEmptyState ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 border border-gray-100">
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
              {patientData.map((patient: Patient) => {
                const age = patient.date_of_birth
                  ? Math.floor(
                      (new Date().getTime() -
                        new Date(patient.date_of_birth).getTime()) /
                        (365.25 * 24 * 60 * 60 * 1000)
                    )
                  : null;

                return (
                  <div
                    key={patient.id}
                    className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handlePatientClick(patient)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-base">
                            {patient.name}
                          </h3>
                          <div className="text-sm text-gray-500 mt-1">
                            Ticket:{" "}
                            {patient.sha_number
                              ? maskReferenceNumber(patient.sha_number)
                              : maskReferenceNumber(patient.id.slice(0, 16))}
                          </div>
                        </div>
                      </div>
                      <ActionMenu menuId={`patient-mobile-${patient.id}`}>
                        <ActionMenu.Trigger />
                        <ActionMenu.Content>
                          <ActionMenu.Item
                            onClick={() => {
                              router.push(`/patients/${patient.id}/bookings`);
                            }}
                          >
                            <FiEye className="h-4 w-4" />
                            View Details
                          </ActionMenu.Item>
                          <ActionMenu.Item
                            onClick={() => {
                              // Add edit functionality
                              console.log("Edit patient:", patient.id);
                            }}
                          >
                            <FiEdit className="h-4 w-4" />
                            Edit Patient
                          </ActionMenu.Item>
                          <ActionMenu.Item
                            onClick={() => {
                              // Add delete functionality
                              console.log("Delete patient:", patient.id);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-3 transition-colors"
                          >
                            <FiTrash className="h-4 w-4" />
                            Delete
                          </ActionMenu.Item>
                        </ActionMenu.Content>
                      </ActionMenu>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between py-1">
                        <span className="text-gray-500">Phone:</span>
                        <span className="text-gray-900 font-medium">
                          {patient.phone ? maskPhoneNumber(patient.phone) : "-"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-gray-500">Email:</span>
                        <span className="text-gray-900 font-medium">
                          {patient.email ? maskEmail(patient.email) : "-"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-gray-500">Age:</span>
                        <span className="text-gray-900 font-medium">
                          {age !== null ? age : "-"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-gray-500">Gender:</span>
                        <span className="text-gray-900 font-medium">
                          {patient.gender || "-"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-gray-500">Booking Date:</span>
                        <span className="text-gray-900 font-medium">
                          {formatDateOnlyNairobi(patient.created_at)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-gray-500">Payment Status:</span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          Pending
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-gray-500">Payment Mode:</span>
                        <span className="text-gray-900 font-medium">-</span>
                      </div>
                    </div>
                  </div>
                );
              })}

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
