"use client";
import { useState, useMemo } from "react";
import {
  FaCheck,
  FaTimes,
  FaSearch,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { useBookings } from "@/features/services/bookings/useBookings";
import { useFinanceApproval } from "@/features/bookings/useFinanceApproval";
import { useEligibilityCheck } from "@/features/patients/useEligibilityCheck";
import { useCurrentFacility } from "@/hooks/useAuth";
import { Bookings } from "@/services/apiBooking";
import { ActionMenu } from "@/components/common/ActionMenu";
import { SearchField } from "@/components/common/SearchField";
import Modal from "@/components/common/Modal";
import Pagination from "@/components/common/Pagination";
import { maskPhoneNumber } from "@/lib/maskUtils";

export default function FinanceApprovalPage() {
  const facility = useCurrentFacility();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Get user's facility code (code)
  const code = facility?.code || "";

  const { bookings, isLoading } = useBookings({
    booking_status: "pending",
    code: code,
    page,
    per_page: 20,
  });

  // Filter bookings based on search term
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    if (!searchTerm) return bookings;

    const lowerSearch = searchTerm.toLowerCase();
    return bookings.filter(
      (booking: Bookings) =>
        booking.booking_number.toLowerCase().includes(lowerSearch) ||
        booking.patient.name.toLowerCase().includes(lowerSearch) ||
        booking.patient.phone.toLowerCase().includes(lowerSearch)
    );
  }, [bookings, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Finance Approval
        </h1>
        <p className="text-gray-600">
          Review and approve pending bookings for your facility
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchField
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by booking number, patient name, or phone..."
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredBookings.length}
              </p>
            </div>
            <FaCheckCircle className="w-10 h-10 text-blue-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Services
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FaSearch className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-lg font-medium">
                        No pending bookings found
                      </p>
                      <p className="text-sm">
                        {searchTerm
                          ? "Try adjusting your search criteria"
                          : "All bookings have been processed"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking: Bookings) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.booking_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.patient.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {maskPhoneNumber(booking.patient.phone)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {booking.services.length} service(s)
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.services
                          .slice(0, 2)
                          .map((s: any) => s.service.service.name)
                          .join(", ")}
                        {booking.services.length > 2 && "..."}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">
                        {booking.payment_mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(booking.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <BookingActionsCell booking={booking} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredBookings.length > 0 && bookings && bookings.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <Pagination
              currentPage={page}
              lastPage={Math.ceil(bookings.length / 20)}
              total={bookings.length}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Booking Actions Cell Component
interface BookingActionsCellProps {
  booking: Bookings;
}

function BookingActionsCell({ booking }: BookingActionsCellProps) {
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const { approveFinance, isApproving } = useFinanceApproval();
  const { checkSHAEligibility, isCheckingEligibility, eligibilityResult } =
    useEligibilityCheck();

  const handleCheckEligibility = () => {
    setIsEligibilityModalOpen(true);

    // Automatically check eligibility if patient has identification details
    if (
      booking.patient.identification_no &&
      booking.patient.identification_type
    ) {
      checkSHAEligibility({
        identificationType: booking.patient.identification_type,
        identificationNumber: booking.patient.identification_no,
      });
    }
  };

  const handleFinanceApproval = (
    actionType: "approve" | "cancel",
    onCloseModal?: () => void
  ) => {
    const status = actionType === "approve" ? "confirmed" : "cancelled";

    approveFinance(
      {
        bookingId: booking.id,
        data: {
          payment_mode: "sha",
          status,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            status === "confirmed"
              ? "Booking approved successfully!"
              : "Booking cancelled successfully!"
          );
          onCloseModal?.();
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message ||
              "Failed to process finance approval"
          );
        },
      }
    );
  };

  return (
    <>
      <Modal>
        <ActionMenu menuId={`booking-${booking.id}`}>
          <ActionMenu.Trigger />
          <ActionMenu.Content>
            <ActionMenu.Item onClick={handleCheckEligibility}>
              <FaCheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Check SHA Eligibility</span>
            </ActionMenu.Item>
            <Modal.Open opens={`approve-${booking.id}`}>
              <ActionMenu.Item className="w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 flex items-center gap-3 transition-colors">
                <FaCheck className="w-4 h-4 flex-shrink-0" />
                <span>Approve Booking</span>
              </ActionMenu.Item>
            </Modal.Open>
            <Modal.Open opens={`cancel-${booking.id}`}>
              <ActionMenu.Item className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                <FaTimes className="w-4 h-4 flex-shrink-0" />
                <span>Cancel Booking</span>
              </ActionMenu.Item>
            </Modal.Open>
          </ActionMenu.Content>
        </ActionMenu>
        <Modal.Window name={`approve-${booking.id}`}>
          <ConfirmApprovalModal
            booking={booking}
            actionType="approve"
            onConfirm={(onClose) => handleFinanceApproval("approve", onClose)}
            isProcessing={isApproving}
          />
        </Modal.Window>
        <Modal.Window name={`cancel-${booking.id}`}>
          <ConfirmApprovalModal
            booking={booking}
            actionType="cancel"
            onConfirm={(onClose) => handleFinanceApproval("cancel", onClose)}
            isProcessing={isApproving}
          />
        </Modal.Window>
      </Modal>

      {/* Eligibility Check Modal */}
      {isEligibilityModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  SHA Eligibility Check
                </h2>
                <button
                  onClick={() => setIsEligibilityModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Patient Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium text-gray-900">
                      {booking.patient.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium text-gray-900">
                      {maskPhoneNumber(booking.patient.phone)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">ID Type:</span>
                    <p className="font-medium text-gray-900">
                      {booking.patient.identification_type || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">ID Number:</span>
                    <p className="font-medium text-gray-900">
                      {booking.patient.identification_no || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">SHA Number:</span>
                    <p className="font-medium text-gray-900">
                      {booking.patient.sha_number || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Eligibility Status */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {isCheckingEligibility ? (
                      <FaSpinner className="w-4 h-4 animate-spin text-blue-600" />
                    ) : eligibilityResult?.eligible === true ? (
                      <FaCheckCircle className="w-4 h-4 text-green-600" />
                    ) : eligibilityResult?.eligible === false ? (
                      <FaExclamationTriangle className="w-4 h-4 text-red-600" />
                    ) : (
                      <FaSearch className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      SHA Eligibility Status
                    </span>
                  </div>
                </div>

                {isCheckingEligibility ? (
                  <p className="text-sm text-blue-600">
                    Checking eligibility...
                  </p>
                ) : eligibilityResult ? (
                  <div>
                    <p
                      className={`text-sm ${
                        eligibilityResult.eligible
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {eligibilityResult.eligible
                        ? `✅ ${eligibilityResult.message}`
                        : `❌ ${eligibilityResult.message}`}
                    </p>
                    {eligibilityResult.coverage_end_date && (
                      <p className="text-sm text-blue-700 mt-1">
                        📅 Coverage valid until{" "}
                        {new Date(
                          eligibilityResult.coverage_end_date
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : booking.patient.sha_number ? (
                  <p className="text-sm text-gray-600">
                    Click check button to verify eligibility
                  </p>
                ) : (
                  <p className="text-sm text-orange-600">
                    ⚠️ Patient does not have a SHA number
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                {booking.patient.identification_no &&
                  booking.patient.identification_type && (
                    <button
                      onClick={() => {
                        checkSHAEligibility({
                          identificationType:
                            booking.patient.identification_type!,
                          identificationNumber:
                            booking.patient.identification_no!,
                        });
                      }}
                      disabled={isCheckingEligibility}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isCheckingEligibility ? (
                        <>
                          <FaSpinner className="w-4 h-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="w-4 h-4" />
                          Check Eligibility
                        </>
                      )}
                    </button>
                  )}
                <button
                  onClick={() => setIsEligibilityModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Confirmation Modal Component
interface ConfirmApprovalModalProps {
  booking: Bookings;
  actionType: "approve" | "cancel";
  onConfirm: (onCloseModal?: () => void) => void;
  isProcessing: boolean;
  onCloseModal?: () => void;
}

function ConfirmApprovalModal({
  booking,
  actionType,
  onConfirm,
  isProcessing,
  onCloseModal,
}: ConfirmApprovalModalProps) {
  const isApprove = actionType === "approve";

  return (
    <div className="space-y-4">
      {/* Icon and Title */}
      <div className="flex flex-col items-center text-center mb-4">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isApprove ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isApprove ? (
            <FaCheck className="w-8 h-8 text-green-600" />
          ) : (
            <FaTimes className="w-8 h-8 text-red-600" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {isApprove ? "Approve Booking?" : "Cancel Booking?"}
        </h3>
        <p className="text-gray-600">
          {isApprove
            ? "Are you sure you want to approve this booking?"
            : "Are you sure you want to cancel this booking?"}
        </p>
      </div>

      {/* Booking Details */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Booking Number:</span>
          <span className="font-medium text-gray-900">
            {booking.booking_number}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Patient:</span>
          <span className="font-medium text-gray-900">
            {booking.patient.name}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Phone:</span>
          <span className="font-medium text-gray-900">
            {maskPhoneNumber(booking.patient.phone)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Services:</span>
          <span className="font-medium text-gray-900">
            {booking.services.length} service(s)
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Payment Mode:</span>
          <span className="font-medium text-gray-900 uppercase">
            {booking.payment_mode}
          </span>
        </div>
      </div>

      {/* Warning Message */}
      <div
        className={`p-3 rounded-lg border ${
          isApprove
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <p
          className={`text-sm ${isApprove ? "text-green-700" : "text-red-700"}`}
        >
          {isApprove
            ? "✓ This will confirm the booking and allow the patient to proceed with the scheduled services."
            : "⚠ This action will cancel the booking. The patient will need to create a new booking."}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onCloseModal}
          disabled={isProcessing}
          className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirm(onCloseModal)}
          disabled={isProcessing}
          className={`flex-1 px-4 py-2.5 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors ${
            isApprove
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isProcessing ? (
            <>
              <FaSpinner className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {isApprove ? (
                <FaCheck className="w-4 h-4" />
              ) : (
                <FaTimes className="w-4 h-4" />
              )}
              {isApprove ? "Approve Booking" : "Cancel Booking"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
