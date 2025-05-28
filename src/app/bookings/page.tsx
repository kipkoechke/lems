"use client";

import { useBookingss } from "@/features/services/bookings/useBookings";
import React from "react";

const BookingReport: React.FC = () => {
  const { isLoading, bookings, error } = useBookingss();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading bookings.</div>;

  const bookingsData = bookings ?? [];

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Booking Report</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border-b">Booking Date</th>
            <th className="px-4 py-2 border-b">Patient Name</th>
            <th className="px-4 py-2 border-b">Mobile Number</th>
            <th className="px-4 py-2 border-b">Facility Name</th>
            <th className="px-4 py-2 border-b">Service Name</th>
            <th className="px-4 py-2 border-b">SHA Rate</th>
            <th className="px-4 py-2 border-b">Vendor Share</th>
            <th className="px-4 py-2 border-b">Facility Share</th>
          </tr>
        </thead>
        <tbody>
          {bookingsData.map((booking) => (
            <tr key={booking.bookingId}>
              <td className="px-4 py-2 border-b">{booking.bookingDate}</td>
              <td className="px-4 py-2 border-b">
                {booking.patient.patientName}
              </td>
              <td className="px-4 py-2 border-b">
                {booking.patient.mobileNumber}
              </td>
              <td className="px-4 py-2 border-b">
                {booking.facility.facilityName}
              </td>
              <td className="px-4 py-2 border-b">
                {booking.service.serviceName}
              </td>
              <td className="px-4 py-2 border-b">{booking.service.shaRate}</td>
              <td className="px-4 py-2 border-b">
                {booking.service.vendorShare}
              </td>
              <td className="px-4 py-2 border-b">
                {booking.service.facilityShare}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingReport;
