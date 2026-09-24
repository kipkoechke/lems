"use client";

import { useApproveBooking } from "@/features/services/bookings/useApproveBooking";
import { useBookings } from "@/features/services/bookings/useBookings";
import { useRejectBooking } from "@/features/services/bookings/useRejectBooking";
import {
  Building,
  Calendar,
  Check,
  CheckSquare,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  MinusSquare,
  Square,
  User,
  X,
} from "lucide-react";
import { ActionMenu } from "@/components/common/ActionMenu";
import { FacilityFilter } from "@/components/common/FacilityFilter";
import { VendorFilter } from "@/components/common/VendorFilter";
import { useIsReadOnly } from "@/hooks/usePermissions";
import { useCurrentFacility } from "@/hooks/useAuth";
import { approvalStatus, serviceStatus } from "@/lib/bookingStatus";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { maskPhoneNumber } from "@/lib/maskUtils";

const BookingReport: React.FC = () => {
  // Facility filtering happens server-side — the list spans every facility, so
  // narrowing it client-side would only filter the page you happen to have.
  const [facilityId, setFacilityId] = useState<string>("");
  const [facilityName, setFacilityName] = useState<string>("");
  // Bookings with a service assigned to this vendor. Also filtered
  // server-side, for the same reason as the facility.
  const [vendorId, setVendorId] = useState<string>("");

  // A facility account is pinned to its own facility: the API does not scope
  // this list by the caller, so without it they see every other facility's
  // bookings. Admins keep the free picker.
  const facility = useCurrentFacility();
  const effectiveFacilityId = facility?.id || facilityId;

  const { isLoading, bookings, error, refetchBookings } = useBookings({
    ...(effectiveFacilityId ? { facility_id: effectiveFacilityId } : {}),
    ...(vendorId ? { vendor_id: vendorId } : {}),
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>("all");
  // A view-only account may read this list but never act on it; offering the
  // approve controls would only produce a 403.
  const isReadOnly = useIsReadOnly();
  const { approve, isApproving } = useApproveBooking();
  const { reject, isRejecting } = useRejectBooking();
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());
  const [rejectingIds, setRejectingIds] = useState<Set<string>>(new Set());
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(
    new Set(),
  );
  // Removed dropdownOpen state - replaced with ActionMenu
  // Removed location filters from bookings page

  // Filter bookings based on active tab
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    if (activeTab === "all") return bookings;
    return bookings.filter((booking) => approvalStatus(booking) === activeTab);
  }, [bookings, activeTab]);

  // Get pending bookings from filtered bookings for selection
  const pendingBookings = useMemo(() => {
    return filteredBookings.filter(
      (booking) => approvalStatus(booking) === "pending",
    );
  }, [filteredBookings]);

  // Count bookings by status
  const statusCounts = useMemo(() => {
    if (!bookings) return { all: 0, pending: 0, approved: 0, rejected: 0 };

    const counts = bookings.reduce(
      (acc, booking) => {
        const status = approvalStatus(booking);
        acc[status as keyof typeof acc]++;
        acc.all++;
        return acc;
      },
      { all: 0, pending: 0, approved: 0, rejected: 0 },
    );

    return counts;
  }, [bookings]);

  const tabs = [
    { id: "all", label: "All", count: statusCounts.all },
    { id: "pending", label: "Pending", count: statusCounts.pending },
    { id: "approved", label: "Approved", count: statusCounts.approved },
    { id: "rejected", label: "Rejected", count: statusCounts.rejected },
  ];

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedBookings.size === pendingBookings.length) {
      // If all are selected, deselect all
      setSelectedBookings(new Set());
    } else {
      // Select all pending bookings
      setSelectedBookings(new Set(pendingBookings.map((b) => b.id)));
    }
  };

  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  };

  const handleBulkApprove = async () => {
    const selectedIds = Array.from(selectedBookings);
    setApprovingIds((prev) => new Set([...prev, ...selectedIds]));

    try {
      for (const bookingId of selectedIds) {
        // Find the booking to get the booking_number
        const booking = bookings?.find((b) => b.id === bookingId);
        if (!booking) {
          toast.error(`Booking ${bookingId} not found`);
          continue;
        }

        await new Promise<void>((resolve) => {
          approve(booking.booking_number, {
            onSettled: () => resolve(),
          });
        });
      }
      toast.success(`${selectedIds.length} booking(s) approved successfully!`);
      setSelectedBookings(new Set());
      refetchBookings();
    } finally {
      setApprovingIds((prev) => {
        const newSet = new Set(prev);
        selectedIds.forEach((id) => newSet.delete(id));
        return newSet;
      });
    }
  };

  const handleBulkReject = async () => {
    const selectedIds = Array.from(selectedBookings);
    setRejectingIds((prev) => new Set([...prev, ...selectedIds]));

    try {
      for (const bookingId of selectedIds) {
        // Find the booking to get the booking_number
        const booking = bookings?.find((b) => b.id === bookingId);
        if (!booking) {
          toast.error(`Booking ${bookingId} not found`);
          continue;
        }

        await new Promise<void>((resolve) => {
          reject(booking.booking_number, {
            onSettled: () => resolve(),
          });
        });
      }
      setSelectedBookings(new Set());
      refetchBookings();
    } finally {
      setRejectingIds((prev) => {
        const newSet = new Set(prev);
        selectedIds.forEach((id) => newSet.delete(id));
        return newSet;
      });
    }
  };

  const handleApproval = (bookingId: string) => {
    // Find the booking to get the booking_number
    const booking = bookings?.find((b) => b.id === bookingId);
    if (!booking) {
      toast.error("Booking not found");
      return;
    }

    setApprovingIds((prev) => new Set(prev).add(bookingId));
    approve(booking.booking_number, {
      onSettled: () => {
        setApprovingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(bookingId);
          return newSet;
        });
        refetchBookings();
      },
    });
  };

  const handleRejection = (bookingId: string) => {
    // Find the booking to get the booking_number
    const booking = bookings?.find((b) => b.id === bookingId);
    if (!booking) {
      toast.error("Booking not found");
      return;
    }

    setApprovingIds((prev) => new Set(prev).add(bookingId));
    reject(booking.booking_number, {
      onSettled: () => {
        setApprovingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(bookingId);
          return newSet;
        });
        refetchBookings();
      },
    });
  };

  const toggleExpandRow = (bookingId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", icon: Check },
      rejected: { color: "bg-red-100 text-red-800", icon: X },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig["pending"];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(typeof amount === "string" ? parseFloat(amount) : amount);
  };

  // Get the appropriate icon for select all checkbox
  const getSelectAllIcon = () => {
    if (selectedBookings.size === 0) return Square;
    if (selectedBookings.size === pendingBookings.length) return CheckSquare;
    return MinusSquare; // Partial selection
  };

  const SelectAllIcon = getSelectAllIcon();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <X className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading bookings
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Services
          </h3>
          <span className="text-sm text-gray-500">
            ({filteredBookings.length} bookings)
          </span>
        </div>

        {/* Facility and vendor filters */}
        <div className="mb-5 flex flex-wrap items-end gap-3">
          <div className={`w-full sm:w-80 ${facility?.id ? "hidden" : ""}`}>
            <FacilityFilter
              value={facilityId}
              onChange={(id, facility) => {
                setFacilityId(id);
                setFacilityName(facility?.name ?? "");
                setSelectedBookings(new Set());
              }}
            />
          </div>
          {facilityId && !facility?.id && (
            <button
              onClick={() => {
                setFacilityId("");
                setFacilityName("");
                setSelectedBookings(new Set());
              }}
              className="mb-0.5 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              <Building className="h-3 w-3" />
              {facilityName || "Selected facility"}
              <X className="h-3 w-3" />
            </button>
          )}

          <div className="w-full sm:w-72">
            <VendorFilter
              value={vendorId}
              onChange={(id) => {
                setVendorId(id);
                setSelectedBookings(new Set());
              }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedBookings(new Set()); // Clear selection when switching tabs
                }}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bulk Actions Bar */}
        {pendingBookings.length > 0 && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 outline-hidden">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <SelectAllIcon className="h-4 w-4 mr-2" />
                  {selectedBookings.size === 0
                    ? "Select All"
                    : selectedBookings.size === pendingBookings.length
                      ? "Deselect All"
                      : `Select All (${selectedBookings.size} selected)`}
                </button>
                {selectedBookings.size > 0 && (
                  <span className="text-sm text-gray-500">
                    {selectedBookings.size} of {pendingBookings.length} pending
                    bookings selected
                  </span>
                )}
              </div>

              {selectedBookings.size > 0 && !isReadOnly && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleBulkApprove}
                    disabled={
                      isApproving ||
                      Array.from(selectedBookings).some((id) =>
                        approvingIds.has(id),
                      )
                    }
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm inline-flex items-center"
                  >
                    {isApproving ||
                    Array.from(selectedBookings).some((id) =>
                      approvingIds.has(id),
                    ) ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Approving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Approve Selected ({selectedBookings.size})
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleBulkReject}
                    disabled={
                      isRejecting ||
                      Array.from(selectedBookings).some((id) =>
                        rejectingIds.has(id),
                      )
                    }
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm inline-flex items-center"
                  >
                    {isRejecting ||
                    Array.from(selectedBookings).some((id) =>
                      approvingIds.has(id),
                    ) ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Reject Selected ({selectedBookings.size})
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No {activeTab === "all" ? "" : activeTab} bookings found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {facilityId
                ? `No ${activeTab === "all" ? "" : activeTab} bookings for ${facilityName || "this facility"}.`
                : activeTab === "all"
                  ? "No bookings have been made yet."
                  : `No ${activeTab} bookings at the moment.`}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  {pendingBookings.length > 0 && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center hover:text-gray-700"
                      >
                        <SelectAllIcon className="h-4 w-4" />
                      </button>
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient & Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service & Facility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Breakdown
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <React.Fragment key={booking.id}>
                    <tr className="hover:bg-gray-50">
                      {pendingBookings.length > 0 && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {approvalStatus(booking) === "pending" ? (
                            <button
                              onClick={() => handleSelectBooking(booking.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {selectedBookings.has(booking.id) ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          ) : (
                            <div className="w-4 h-4"></div>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-0">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.patient.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {maskPhoneNumber(booking.patient.phone)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {booking.booking_date
                                ? formatDate(booking.booking_date)
                                : booking.services &&
                                    booking.services.length > 0 &&
                                    (booking.services[0].booking_date ||
                                      booking.services[0].scheduled_date)
                                  ? formatDate(
                                      booking.services[0].booking_date ||
                                        booking.services[0].scheduled_date ||
                                        "",
                                    )
                                  : formatDate(booking.created_at)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal break-words">
                        <div className="text-sm text-gray-900">
                          {booking.services && booking.services.length > 0 ? (
                            <div className="space-y-2">
                              {booking.services.map((service, index) => (
                                <div
                                  key={service.id}
                                  className="border-l-2 border-blue-200 pl-2"
                                >
                                  <div className="font-medium break-words">
                                    {service.service?.name || "N/A"}
                                  </div>
                                  <div className="text-gray-500 break-words">
                                    {service.service?.code || "N/A"}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1 break-words">
                                    <Building className="inline h-3 w-3 mr-1" />
                                    {booking.facility?.name || "N/A"}
                                  </div>
                                  <div className="text-xs text-blue-600 mt-1">
                                    Status:{" "}
                                    {serviceStatus(service).replace(/_/g, " ") ||
                                      "-"}
                                  </div>
                                  {booking.services.length > 1 &&
                                    index < booking.services.length - 1 && (
                                      <div className="border-b border-gray-100 my-1"></div>
                                    )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            // No services available
                            <div>
                              <div className="font-medium break-words text-gray-400">
                                No services
                              </div>
                              <div className="text-xs text-gray-400 mt-1 break-words">
                                <Building className="inline h-3 w-3 mr-1" />
                                {booking.facility?.name || "N/A"}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.services && booking.services.length > 0 ? (
                            <div className="space-y-3">
                              {booking.services.map((service, index) => (
                                <div
                                  key={service.id}
                                  className="border-l-2 border-green-200 pl-2"
                                >
                                  <div className="text-xs text-gray-600 space-y-0.5">
                                    <div className="flex justify-between items-center">
                                      <span className="text-blue-600">
                                        SHA Rate:
                                      </span>
                                      <span className="font-medium">
                                        {formatCurrency(
                                          service.service?.sha_rate ||
                                            service.tariff ||
                                            service.sha ||
                                            "0",
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-green-600">
                                        Vendor Share:
                                      </span>
                                      <span className="font-medium">
                                        {formatCurrency(
                                          service.vendor_share ||
                                            service.revenue?.vendor_share ||
                                            "0",
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-purple-600">
                                        Facility Share:
                                      </span>
                                      <span className="font-medium">
                                        {formatCurrency(
                                          service.facility_share ||
                                            service.revenue?.facility_share ||
                                            "0",
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  {booking.services.length > 1 &&
                                    index < booking.services.length - 1 && (
                                      <div className="border-b border-gray-100 my-2"></div>
                                    )}
                                </div>
                              ))}
                              {booking.services.length > 1 && (
                                <div className="border-t border-gray-200 pt-2 mt-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-900 font-bold">
                                      Total:
                                    </span>
                                    <span className="font-bold">
                                      {formatCurrency(
                                        booking.services.reduce(
                                          (total, service) => {
                                            const vendorShare = parseFloat(
                                              service.vendor_share || "0",
                                            );
                                            const facilityShare = parseFloat(
                                              service.facility_share || "0",
                                            );
                                            return (
                                              total +
                                              vendorShare +
                                              facilityShare
                                            );
                                          },
                                          0,
                                        ),
                                      )}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            // No services available
                            <div className="text-xs text-gray-400">
                              No service pricing available
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            <CreditCard className="inline h-3 w-3 mr-1" />
                            Payment Mode: {booking.payment_mode || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(approvalStatus(booking))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <ActionMenu menuId={`booking-${booking.id}`}>
                          <ActionMenu.Trigger />
                          <ActionMenu.Content>
                            <ActionMenu.Item
                              onClick={() => toggleExpandRow(booking.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {expandedRows.has(booking.id)
                                ? "Hide Details"
                                : "View Details"}
                            </ActionMenu.Item>

                            {approvalStatus(booking) === "pending" &&
                              !isReadOnly && (
                              <>
                                <ActionMenu.Item
                                  onClick={() => handleApproval(booking.id)}
                                  disabled={approvingIds.has(booking.id)}
                                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white my-1"
                                >
                                  {approvingIds.has(booking.id) ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Approving...
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4 mr-2" />
                                      Approve
                                    </>
                                  )}
                                </ActionMenu.Item>
                                <ActionMenu.Item
                                  onClick={() => handleRejection(booking.id)}
                                  disabled={isRejecting}
                                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white my-1"
                                >
                                  {isRejecting ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Rejecting...
                                    </>
                                  ) : (
                                    <>
                                      <X className="h-4 w-4 mr-2" />
                                      Reject
                                    </>
                                  )}
                                </ActionMenu.Item>
                              </>
                            )}
                          </ActionMenu.Content>
                        </ActionMenu>
                      </td>
                    </tr>

                    {expandedRows.has(booking.id) && (
                      <tr>
                        <td
                          colSpan={pendingBookings.length > 0 ? 6 : 5}
                          className="px-6 py-4 bg-gray-50"
                        >
                          <div className="space-y-6">
                            {/* Patient and Facility Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                  <User className="h-4 w-4 mr-2" />
                                  Patient Details
                                </h4>
                                <div className="text-sm space-y-1">
                                  <p>
                                    <span className="text-gray-500">DOB:</span>
                                    {booking.patient.date_of_birth
                                      ? new Date(
                                          booking.patient.date_of_birth,
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </p>
                                  <p>
                                    <span className="text-gray-500">
                                      SHA Number:
                                    </span>
                                    {booking.patient.sha_number || "N/A"}
                                  </p>
                                  <p>
                                    <span className="text-gray-500">
                                      Patient ID:
                                    </span>
                                    {booking.patient.id.slice(-8)}
                                  </p>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                  <Building className="h-4 w-4 mr-2" />
                                  Booking Details
                                </h4>
                                <div className="text-sm space-y-1">
                                  <p>
                                    <span className="text-gray-500">
                                      Booking Number:
                                    </span>
                                    {booking.booking_number}
                                  </p>
                                  <p>
                                    <span className="text-gray-500">
                                      Booking Status:
                                    </span>
                                    {booking.booking_status}
                                  </p>
                                  <p>
                                    <span className="text-gray-500">
                                      Created:
                                    </span>
                                    {formatDate(booking.created_at)}
                                  </p>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Total Cost Summary
                                </h4>
                                <div className="text-sm space-y-2">
                                  {booking.services &&
                                  booking.services.length > 0 ? (
                                    <>
                                      <div className="flex justify-between">
                                        <span className="text-blue-600 font-medium">
                                          Total SHA Rate:
                                        </span>
                                        <span className="font-semibold">
                                          {formatCurrency(
                                            booking.services.reduce(
                                              (total, service) => {
                                                return (
                                                  total +
                                                  parseFloat(
                                                    service.service?.sha_rate ||
                                                      service.tariff ||
                                                      "0",
                                                  )
                                                );
                                              },
                                              0,
                                            ),
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-green-600 font-medium">
                                          Total Vendor Share:
                                        </span>
                                        <span className="font-semibold">
                                          {formatCurrency(
                                            booking.services.reduce(
                                              (total, service) => {
                                                return (
                                                  total +
                                                  parseFloat(
                                                    service.vendor_share || "0",
                                                  )
                                                );
                                              },
                                              0,
                                            ),
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-purple-600 font-medium">
                                          Total Facility Share:
                                        </span>
                                        <span className="font-semibold">
                                          {formatCurrency(
                                            booking.services.reduce(
                                              (total, service) => {
                                                return (
                                                  total +
                                                  parseFloat(
                                                    service.facility_share ||
                                                      "0",
                                                  )
                                                );
                                              },
                                              0,
                                            ),
                                          )}
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    // No services available
                                    <div className="text-gray-400 text-sm">
                                      No pricing information available
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Services Details */}
                            {booking.services &&
                              booking.services.length > 0 && (
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Services Details ({
                                      booking.services.length
                                    }{" "}
                                    service
                                    {booking.services.length > 1 ? "s" : ""})
                                  </h4>
                                  <div className="space-y-4">
                                    {booking.services.map((service) => (
                                      <div
                                        key={service.id}
                                        className="border border-gray-200 rounded-lg p-4"
                                      >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                          <div>
                                            <h5 className="font-medium text-gray-900 mb-2">
                                              Service Information
                                            </h5>
                                            <div className="text-sm space-y-1">
                                              <p>
                                                <span className="text-gray-500">
                                                  Name:
                                                </span>
                                                {service.service?.name || "N/A"}
                                              </p>
                                              <p>
                                                <span className="text-gray-500">
                                                  Code:
                                                </span>
                                                {service.service?.code || "N/A"}
                                              </p>
                                              <p>
                                                <span className="text-gray-500">
                                                  Status:
                                                </span>
                                                <span
                                                  className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                                    serviceStatus(service) ===
                                                    "completed"
                                                      ? "bg-green-100 text-green-800"
                                                      : "bg-yellow-100 text-yellow-800"
                                                  }`}
                                                >
                                                  {serviceStatus(service)}
                                                </span>
                                              </p>
                                            </div>
                                          </div>

                                          <div>
                                            <h5 className="font-medium text-gray-900 mb-2">
                                              Facility Information
                                            </h5>
                                            <div className="text-sm space-y-1">
                                              <p>
                                                <span className="text-gray-500">
                                                  Facility:
                                                </span>
                                                {booking.facility?.name ||
                                                  "N/A"}
                                              </p>
                                              <p>
                                                <span className="text-gray-500">
                                                  Code:
                                                </span>
                                                {booking.facility?.code ||
                                                  "N/A"}
                                              </p>
                                              <p>
                                                <span className="text-gray-500">
                                                  Level:
                                                </span>
                                                {booking.facility?.keph_level ||
                                                  "N/A"}
                                              </p>
                                            </div>
                                          </div>

                                          <div>
                                            <h5 className="font-medium text-gray-900 mb-2">
                                              Cost & Schedule
                                            </h5>
                                            <div className="text-sm space-y-1">
                                              <p>
                                                <span className="text-gray-500">
                                                  Scheduled:
                                                </span>
                                                {formatDate(
                                                  service.scheduled_date ||
                                                    service.booking_date ||
                                                    "",
                                                )}
                                              </p>
                                              <p>
                                                <span className="text-gray-500">
                                                  SHA Rate:
                                                </span>
                                                {formatCurrency(
                                                  service.service?.sha_rate ||
                                                    service.tariff ||
                                                    "0",
                                                )}
                                              </p>
                                              <p>
                                                <span className="text-gray-500">
                                                  Vendor Share:
                                                </span>
                                                {formatCurrency(
                                                  service.vendor_share || "0",
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingReport;
