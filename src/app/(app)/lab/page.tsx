"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookings } from "@/services/apiBooking";
import { useBookings } from "@/features/services/bookings/useBookings";
import {
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaCalendar,
  FaPhone,
  FaIdCard,
  FaFlask,
} from "react-icons/fa";
import { maskPhoneNumber } from "@/lib/maskUtils";

export default function LabServicesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Bookings | null>(null);

  // Fetch bookings with booking_status=confirmed and approval_status=pending
  // Note: facility filter handled on backend based on user's facility
  const { bookings, isLoading } = useBookings({
    booking_status: "confirmed",
    approval_status: "pending",
  });

  const filteredBookings = bookings?.filter((booking: Bookings) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      booking.booking_number?.toLowerCase().includes(search) ||
      booking.patient?.name?.toLowerCase().includes(search) ||
      booking.patient?.phone?.includes(search) ||
      booking.patient?.identification_no?.toLowerCase().includes(search)
    );
  });

  const handleBookingSelect = (booking: Bookings) => {
    setSelectedBooking(booking);
  };

  const handleCompleteService = (booking: Bookings) => {
    // Navigate to service completion page with booking info
    sessionStorage.setItem("serviceCompletionBooking", JSON.stringify(booking));
    router.push("/lab/complete-service");
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
    <div className="h-full flex bg-gray-50">
      {/* Bookings List Section */}
      <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden h-full">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Service Completion
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Confirmed bookings pending service completion
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <FaFlask className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Total Pending</p>
                <p className="text-lg font-bold text-blue-600">
                  {filteredBookings?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by booking number, patient name, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Bookings List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredBookings && filteredBookings.length > 0 ? (
            <div className="space-y-3">
              {filteredBookings.map((booking: Bookings) => (
                <button
                  key={booking.id}
                  onClick={() => handleBookingSelect(booking)}
                  className={`w-full bg-white rounded-lg p-4 hover:shadow-lg transition-shadow border-2 text-left ${
                    selectedBooking?.id === booking.id
                      ? "border-blue-600 shadow-lg"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {booking.booking_number}
                        </span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-medium">
                          Pending Completion
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <FaUser className="w-3 h-3 text-gray-400" />
                          <span className="font-medium">
                            {booking.patient?.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaPhone className="w-3 h-3 text-gray-400" />
                          <span>
                            {booking.patient?.phone
                              ? maskPhoneNumber(booking.patient.phone)
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaIdCard className="w-3 h-3 text-gray-400" />
                          <span>
                            {booking.patient?.identification_no || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaCalendar className="w-3 h-3 text-gray-400" />
                          <span>
                            {new Date(booking.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          {booking.services?.length || 0} service(s)
                        </p>
                      </div>
                    </div>

                    {selectedBooking?.id === booking.id && (
                      <FaCheckCircle className="w-5 h-5 text-blue-600 ml-2" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FaClock className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No pending bookings</p>
              <p className="text-sm">
                {searchTerm
                  ? "No bookings match your search"
                  : "All services have been completed"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Sidebar */}
      <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        {selectedBooking ? (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Booking Details
            </h3>

            {/* Patient Information */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Patient Information
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium text-gray-900">
                    {selectedBooking.patient?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Age:</span>
                  <p className="font-medium text-gray-900">
                    {selectedBooking.patient?.date_of_birth
                      ? `${calculateAge(
                          selectedBooking.patient.date_of_birth
                        )} years`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <p className="font-medium text-gray-900">
                    {selectedBooking.patient?.phone
                      ? maskPhoneNumber(selectedBooking.patient.phone)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">ID Number:</span>
                  <p className="font-medium text-gray-900">
                    {selectedBooking.patient?.identification_no || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Booking Information
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Booking Number:</span>
                  <p className="font-medium text-gray-900">
                    {selectedBooking.booking_number}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Booking Date:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedBooking.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Payment Mode:</span>
                  <p className="font-medium text-gray-900 uppercase">
                    {selectedBooking.payment_mode || "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Status:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                    {selectedBooking.booking_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Services ({selectedBooking.services?.length || 0})
              </h4>
              <div className="space-y-2">
                {selectedBooking.services?.map((service, index) => (
                  <div
                    key={service.id}
                    className="p-3 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {service.service?.service?.name ||
                            `Service ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Code: {service.service?.service?.code || "N/A"}
                        </p>
                        <p className="text-xs text-gray-600">
                          Scheduled:{" "}
                          {new Date(service.booking_date).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          service.service_status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {service.service_status === "completed"
                          ? "Completed"
                          : "Not Started"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Service Button */}
            <button
              onClick={() => handleCompleteService(selectedBooking)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <FaCheckCircle className="w-5 h-5" />
              <span>Complete Service</span>
            </button>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center text-gray-500">
              <FaUser className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Select a booking to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
