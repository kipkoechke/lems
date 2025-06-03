"use client";

import { useApproveBooking } from "@/features/services/bookings/useApproveBooking";
import { useBookings } from "@/features/services/bookings/useBookings";
import {
  Building,
  Check,
  CreditCard,
  DollarSign,
  Users,
  Wrench,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";

interface PaymentSummaryItem {
  facilityName: string;
  facilityId: string;
  equipmentVendor: string;
  serviceCategory: string;
  patientCount: number;
  shaRate: number;
  facilityShare: number;
  vendorShare: number;
  bookingIds: string[];
}

const PaymentReport: React.FC = () => {
  const { isLoading, bookings, error, refetchBookings } = useBookings();
  const { approve, isApproving } = useApproveBooking();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [approvingItems, setApprovingItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"summary" | "approved">("summary");

  // Filter bookings by status for different tabs
  const pendingBookings =
    bookings?.filter((booking) => booking.status === "Pending") || [];
  const approvedBookings =
    bookings?.filter((booking) => booking.status === "Approved") || [];

  // Generate payment summary from pending bookings
  const paymentSummary = useMemo(() => {
    if (!pendingBookings.length) return [];

    const summaryMap = new Map<string, PaymentSummaryItem>();

    pendingBookings.forEach((booking) => {
      const key = `${booking.facility.facilityId}-${booking.equipment.category.vendorName}-${booking.service.category.categoryName}`;

      if (summaryMap.has(key)) {
        const existing = summaryMap.get(key)!;
        existing.patientCount += 1;
        existing.bookingIds.push(booking.bookingId);
      } else {
        summaryMap.set(key, {
          facilityName: booking.facility.facilityName,
          facilityId: booking.facility.facilityId,
          equipmentVendor: booking.equipment.category.vendorName,
          serviceCategory: booking.service.category.categoryName,
          patientCount: 1,
          shaRate: parseFloat(booking.service.shaRate || booking.cost),
          facilityShare: parseFloat(booking.service.facilityShare || "0"),
          vendorShare: parseFloat(booking.service.vendorShare || "0"),
          bookingIds: [booking.bookingId],
        });
      }
    });

    return Array.from(summaryMap.values());
  }, [pendingBookings]);

  // Generate approved summary from approved bookings
  const approvedSummary = useMemo(() => {
    if (!approvedBookings.length) return [];

    const summaryMap = new Map<string, PaymentSummaryItem>();

    approvedBookings.forEach((booking) => {
      const key = `${booking.facility.facilityId}-${booking.equipment.category.vendorName}-${booking.service.category.categoryName}`;

      if (summaryMap.has(key)) {
        const existing = summaryMap.get(key)!;
        existing.patientCount += 1;
        existing.bookingIds.push(booking.bookingId);
      } else {
        summaryMap.set(key, {
          facilityName: booking.facility.facilityName,
          facilityId: booking.facility.facilityId,
          equipmentVendor: booking.equipment.category.vendorName,
          serviceCategory: booking.service.category.categoryName,
          patientCount: 1,
          shaRate: parseFloat(booking.service.shaRate || booking.cost),
          facilityShare: parseFloat(booking.service.facilityShare || "0"),
          vendorShare: parseFloat(booking.service.vendorShare || "0"),
          bookingIds: [booking.bookingId],
        });
      }
    });

    return Array.from(summaryMap.values());
  }, [approvedBookings]);

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(typeof amount === "string" ? parseFloat(amount) : amount);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === paymentSummary.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(
        new Set(paymentSummary.map((_, index) => index.toString()))
      );
    }
  };

  const handleSelectItem = (index: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleApprove = async (itemIndex?: string) => {
    const itemsToApprove = itemIndex ? [itemIndex] : Array.from(selectedItems);

    if (itemsToApprove.length === 0) return;

    setApprovingItems(new Set(itemsToApprove));

    try {
      // Get all booking IDs from selected items
      const bookingIds = itemsToApprove.flatMap(
        (index) => paymentSummary[parseInt(index)]?.bookingIds || []
      );

      // Approve all bookings
      for (const bookingId of bookingIds) {
        await new Promise((resolve, reject) => {
          approve(bookingId, {
            onSuccess: resolve,
            onError: reject,
          });
        });
      }

      // Clear selections and refresh data
      setSelectedItems(new Set());
      refetchBookings();
    } catch (error) {
      console.error("Error approving bookings:", error);
    } finally {
      setApprovingItems(new Set());
    }
  };

  const handleReject = (itemIndex: string) => {
    // For now, we'll just remove from selection
    // In a real implementation, you'd update the booking status to "Rejected"
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemIndex);
      return newSet;
    });

    console.log("Rejecting item:", paymentSummary[parseInt(itemIndex)]);
    // Here you would implement the rejection logic
    // This might involve calling a rejection API or updating booking status
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <X className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading payment data
            </h3>
            <div className="mt-2 text-sm text-red-700">{error.message}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="px-4 py-5 sm:p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("summary")}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === "summary"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Payment Summary ({paymentSummary.length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === "approved"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Approved Services ({approvedSummary.length})
          </button>
        </div>

        {activeTab === "summary" && (
          <>
            {/* Payment Summary Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Payment Summary Report
              </h3>
              <div className="flex space-x-2">
                {paymentSummary.length > 0 && (
                  <>
                    <button
                      onClick={handleSelectAll}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      {selectedItems.size === paymentSummary.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                    {selectedItems.size > 0 && (
                      <>
                        <button
                          onClick={() => handleApprove()}
                          disabled={approvingItems.size > 0}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm inline-flex items-center"
                        >
                          {approvingItems.size > 0 ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Approving...
                            </>
                          ) : (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Approve Selected ({selectedItems.size})
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {paymentSummary.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No pending payments
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  All bookings have been processed.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        <input
                          type="checkbox"
                          checked={
                            selectedItems.size === paymentSummary.length &&
                            paymentSummary.length > 0
                          }
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                        Facility Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                        Equipment Vendor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                        Service Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                        Patients
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                        SHA Rate
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                        Facility Share
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                        Vendor Share
                      </th>
                      <th className="sticky right-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200 min-w-[160px]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentSummary.map((item, index) => (
                      <tr
                        key={`${item.facilityId}-${item.equipmentVendor}-${item.serviceCategory}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="sticky left-0 z-10 bg-white px-4 py-4 whitespace-nowrap border-r border-gray-200">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(index.toString())}
                            onChange={() => handleSelectItem(index.toString())}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                            <div
                              className="text-sm font-medium text-gray-900 truncate max-w-[140px]"
                              title={item.facilityName}
                            >
                              {item.facilityName}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Wrench className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                            <div
                              className="text-sm text-gray-900 truncate max-w-[110px]"
                              title={item.equipmentVendor}
                            >
                              {item.equipmentVendor}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div
                            className="text-sm text-gray-900 truncate max-w-[100px]"
                            title={item.serviceCategory}
                          >
                            {item.serviceCategory}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-purple-600 mr-1 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900">
                              {item.patientCount}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">
                            {formatCurrency(item.shaRate)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            {formatCurrency(item.facilityShare)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-purple-600">
                            {formatCurrency(item.vendorShare)}
                          </div>
                        </td>
                        <td className="sticky right-0 z-10 bg-white px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2 border-l border-gray-200">
                          <button
                            onClick={() => handleApprove(index.toString())}
                            disabled={approvingItems.has(index.toString())}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-2 py-1 rounded text-xs inline-flex items-center"
                          >
                            {approvingItems.has(index.toString()) ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Approving...
                              </>
                            ) : (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(index.toString())}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs inline-flex items-center"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === "approved" && (
          <>
            {/* Approved Services Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Approved Services Report
              </h3>
            </div>

            {approvedSummary.length === 0 ? (
              <div className="text-center py-12">
                <Check className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No approved services
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Approved services will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                        Facility Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                        Equipment Vendor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                        Service Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                        Patients
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                        SHA Rate
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                        Facility Share
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                        Vendor Share
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {approvedSummary.map((item, index) => (
                      <tr
                        key={`approved-${item.facilityId}-${item.equipmentVendor}-${item.serviceCategory}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                            <div
                              className="text-sm font-medium text-gray-900 truncate max-w-[140px]"
                              title={item.facilityName}
                            >
                              {item.facilityName}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Wrench className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                            <div
                              className="text-sm text-gray-900 truncate max-w-[110px]"
                              title={item.equipmentVendor}
                            >
                              {item.equipmentVendor}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div
                            className="text-sm text-gray-900 truncate max-w-[100px]"
                            title={item.serviceCategory}
                          >
                            {item.serviceCategory}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-purple-600 mr-1 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900">
                              {item.patientCount}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">
                            {formatCurrency(item.shaRate)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            {formatCurrency(item.facilityShare)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-purple-600">
                            {formatCurrency(item.vendorShare)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Approved
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Summary Statistics */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Pending Value
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(
                        paymentSummary.reduce(
                          (acc, item) => acc + item.shaRate * item.patientCount,
                          0
                        )
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Patients
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {paymentSummary.reduce(
                        (acc, item) => acc + item.patientCount,
                        0
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Approved Patients
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {approvedSummary.reduce(
                        (acc, item) => acc + item.patientCount,
                        0
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReport;
