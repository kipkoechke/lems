"use client";
import { useState } from "react";
import {
  FaCheck,
  FaTimes,
  FaSearch,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { useWorklist } from "@/features/worklist/useWorklist";
import { useFinanceApproval } from "@/features/bookings/useFinanceApproval";
import { useEligibilityCheck } from "@/features/patients/useEligibilityCheck";
import type { WorklistBooking } from "@/types/worklist";
import { ActionMenu } from "@/components/common/ActionMenu";
import { SearchField } from "@/components/common/SearchField";
import Modal from "@/components/common/Modal";
import Pagination from "@/components/common/Pagination";
import { maskPhoneNumber } from "@/lib/maskUtils";

export default function FinanceApprovalPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useWorklist({
    page,
    per_page: 20,
    search: searchTerm || undefined,
    finance_approved: false,
  });

  const bookings = data?.data || [];
  const summary = data?.summary;
  const pagination = data?.pagination;

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
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.total_bookings}
                </p>
              </div>
              <FaCheckCircle className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Patients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.unique_patients}
                </p>
              </div>
              <FaCheckCircle className="w-10 h-10 text-emerald-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {parseFloat(summary.total_tariff).toLocaleString()}
                </p>
              </div>
              <FaCheckCircle className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </div>
        </div>
      )}

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
              {bookings.length === 0 ? (
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
                bookings.map((booking: WorklistBooking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.booking_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.patient?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {maskPhoneNumber(booking.patient?.phone || "")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {booking.services_count} service(s)
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.services
                          .slice(0, 2)
                          .map((s) => s.service.name)
                          .join(", ")}
                        {booking.services_count > 2 && "..."}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">
                        SHA
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
        {pagination && pagination.last_page > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              total={pagination.total}
              from={pagination.from}
              to={pagination.to}
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
  booking: WorklistBooking;
}

function BookingActionsCell({ booking }: BookingActionsCellProps) {
  const { approveFinance, isApproving } = useFinanceApproval();
  const { checkSHAEligibility, isCheckingEligibility, eligibilityResult } =
    useEligibilityCheck();

  const handleFinanceApproval = (
    services: Array<{ booked_service_id: string; sha: number; cash: number; other_insurance: number }>,
    onCloseModal?: () => void
  ) => {
    approveFinance(
      {
        bookingId: booking.id,
        data: {
          services,
        },
      },
      {
        onSuccess: () => {
          toast.success("Booking approved successfully!");
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
            <Modal.Open opens={`eligibility-${booking.id}`}>
              <ActionMenu.Item className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors">
                <FaCheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>Check SHA Eligibility</span>
              </ActionMenu.Item>
            </Modal.Open>
            <Modal.Open opens={`approve-${booking.id}`}>
              <ActionMenu.Item className="w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 flex items-center gap-3 transition-colors">
                <FaCheck className="w-4 h-4 flex-shrink-0" />
                <span>Approve Booking</span>
              </ActionMenu.Item>
            </Modal.Open>
          </ActionMenu.Content>
        </ActionMenu>
        <Modal.Window name={`eligibility-${booking.id}`}>
          <EligibilityCheckModal
            booking={booking}
            onCheck={checkSHAEligibility}
            isChecking={isCheckingEligibility}
            result={eligibilityResult}
          />
        </Modal.Window>
        <Modal.Window name={`approve-${booking.id}`}>
          <ApprovalModal
            booking={booking}
            onConfirm={handleFinanceApproval}
            isProcessing={isApproving}
          />
        </Modal.Window>
      </Modal>
    </>
  );
}

// Eligibility Check Modal Component
interface EligibilityCheckModalProps {
  booking: WorklistBooking;
  onCheck: (params: {
    identificationType: string;
    identificationNumber: string;
  }) => void;
  isChecking: boolean;
  result: any;
  onCloseModal?: () => void;
}

function EligibilityCheckModal({
  booking,
  onCheck,
  isChecking,
  result,
  onCloseModal,
}: EligibilityCheckModalProps) {
  const [selectedIdType, setSelectedIdType] = useState("National ID");

  const idTypes = [
    "National ID",
    "Alien ID",
    "Refugee ID",
    "Temporary ID",
    "Mandate Number",
    "Birth Certificate",
    "Birth Notification",
  ];

  const handleCheckEligibility = () => {
    if (booking.patient?.identification_no && selectedIdType) {
      onCheck({
        identificationType: selectedIdType,
        identificationNumber: booking.patient.identification_no,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Icon and Title */}
      <div className="flex flex-col items-center text-center mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <FaCheckCircle className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          SHA Eligibility Check
        </h3>
        <p className="text-gray-600">
          Verify patient&apos;s SHA coverage eligibility
        </p>
      </div>

      {/* Patient Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Patient Information
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Name:</span>
            <p className="font-medium text-gray-900">
              {booking.patient?.name || "N/A"}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Phone:</span>
            <p className="font-medium text-gray-900">
              {maskPhoneNumber(booking.patient?.phone || "")}
            </p>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">ID Number:</span>
            <p className="font-medium text-gray-900">
              {booking.patient?.identification_no || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* ID Type Selection */}
      <div>
        <label
          htmlFor="idType"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Identification Type
        </label>
        <select
          id="idType"
          value={selectedIdType}
          onChange={(e) => setSelectedIdType(e.target.value)}
          disabled={isChecking}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {idTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Eligibility Status */}
      {result && (
        <div
          className={`p-4 rounded-lg border ${
            result.eligible
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {result.eligible ? (
              <FaCheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <FaExclamationTriangle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium text-gray-900">
              {result.eligible ? "Eligible" : "Not Eligible"}
            </span>
          </div>
          <p
            className={`text-sm ${
              result.eligible ? "text-green-700" : "text-red-700"
            }`}
          >
            {result.message}
          </p>
          {result.coverage_end_date && (
            <p className="text-sm text-gray-700 mt-2">
              📅 Coverage valid until{" "}
              {new Date(result.coverage_end_date).toLocaleDateString()}
            </p>
          )}
        </div>
      )}



      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onCloseModal}
          disabled={isChecking}
          className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Close
        </button>
        {booking.patient?.identification_no && (
          <button
            onClick={handleCheckEligibility}
            disabled={isChecking}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {isChecking ? (
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
      </div>
    </div>
  );
}

// Approval Modal Component with Payment Breakdown
interface ApprovalModalProps {
  booking: WorklistBooking;
  onConfirm: (services: Array<{ booked_service_id: string; sha: number; cash: number; other_insurance: number }>, onCloseModal?: () => void) => void;
  isProcessing: boolean;
  onCloseModal?: () => void;
}

function ApprovalModal({
  booking,
  onConfirm,
  isProcessing,
  onCloseModal,
}: ApprovalModalProps) {
  // Initialize payment breakdown based on service tariffs (default to SHA)
  const [servicePayments, setServicePayments] = useState(
    booking.services.map((service) => ({
      booked_service_id: service.id,
      sha: parseFloat(service.tariff),
      cash: 0,
      other_insurance: 0,
    }))
  );

  const handlePaymentChange = (
    serviceId: string,
    field: "sha" | "cash" | "other_insurance",
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    setServicePayments((prev) =>
      prev.map((sp) =>
        sp.booked_service_id === serviceId ? { ...sp, [field]: numValue } : sp
      )
    );
  };

  const handleSubmit = () => {
    onConfirm(servicePayments, onCloseModal);
  };

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Icon and Title */}
      <div className="flex flex-col items-center text-center mb-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <FaCheck className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Approve Finance Request
        </h3>
        <p className="text-gray-600">
          Review and confirm payment breakdown for each service
        </p>
      </div>

      {/* Booking Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Booking Number:</span>
            <p className="font-medium text-gray-900">{booking.booking_number}</p>
          </div>
          <div>
            <span className="text-gray-600">Patient:</span>
            <p className="font-medium text-gray-900">{booking.patient?.name || "N/A"}</p>
          </div>
          <div>
            <span className="text-gray-600">Phone:</span>
            <p className="font-medium text-gray-900">
              {maskPhoneNumber(booking.patient?.phone || "")}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Total Tariff:</span>
            <p className="font-medium text-gray-900">
              KES {parseFloat(booking.payment.tariff).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Services Payment Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">
          Payment Breakdown by Service
        </h4>
        {booking.services.map((service, index) => {
          const payment = servicePayments[index];
          const total = payment.sha + payment.cash + payment.other_insurance;
          const tariff = parseFloat(service.tariff);
          const isValid = Math.abs(total - tariff) < 0.01;

          return (
            <div
              key={service.id}
              className={`border rounded-lg p-3 ${
                !isValid ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
              }`}
            >
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-900">
                  {service.service.name}
                </p>
                <p className="text-xs text-gray-500">
                  {service.service.code} • LOT {service.lot.number}
                </p>
                <p className="text-xs font-medium text-gray-700 mt-1">
                  Tariff: KES {parseFloat(service.tariff).toLocaleString()}
                  {!isValid && (
                    <span className="text-red-600 ml-2">
                      (Total: KES {total.toLocaleString()} - Must equal tariff!)
                    </span>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">SHA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={payment.sha}
                    onChange={(e) =>
                      handlePaymentChange(service.id, "sha", e.target.value)
                    }
                    disabled={isProcessing}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Cash</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={payment.cash}
                    onChange={(e) =>
                      handlePaymentChange(service.id, "cash", e.target.value)
                    }
                    disabled={isProcessing}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Other</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={payment.other_insurance}
                    onChange={(e) =>
                      handlePaymentChange(service.id, "other_insurance", e.target.value)
                    }
                    disabled={isProcessing}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          onClick={onCloseModal}
          disabled={isProcessing}
          className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={
            isProcessing ||
            servicePayments.some((sp, i) => {
              const total = sp.sha + sp.cash + sp.other_insurance;
              const tariff = parseFloat(booking.services[i].tariff);
              return Math.abs(total - tariff) >= 0.01;
            })
          }
          className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {isProcessing ? (
            <>
              <FaSpinner className="w-4 h-4 animate-spin" />
              Approving...
            </>
          ) : (
            <>
              <FaCheck className="w-4 h-4" />
              Approve Finance
            </>
          )}
        </button>
      </div>
    </div>
  );
}
