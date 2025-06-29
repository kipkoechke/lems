"use client";
import { usePatients } from "@/features/patients/usePatients";
import { useBookings } from "@/features/services/bookings/useBookings";
import { Patient } from "@/services/apiPatient";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaCalendar, FaChevronRight, FaPhone, FaUser } from "react-icons/fa";
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
  const { bookings, isLoading: bookingsLoading } = useBookings();

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
  patient,
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
  const { isLoading, patients, error } = usePatients();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const router = useRouter();

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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <p className="text-gray-600 mt-1">
          Total: {patientData.length} patients
        </p>
      </div>

      {patientData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No patients found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mobile Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date of Birth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patientData.map((patient: Patient, index: number) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handlePatientClick(patient)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {patient.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(patient.date_of_birth).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(patient.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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

      {/* <BookingDetailsModal
        patient={selectedPatient}
        isOpen={showBookingsModal}
        onClose={() => {
          setShowBookingsModal(false);
          setSelectedPatient(null);
        }}
      /> */}
    </div>
  );
}

export default Patients;
