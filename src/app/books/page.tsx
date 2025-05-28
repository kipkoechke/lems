"use client";

import { useBookingss } from "@/features/services/bookings/useBookings";
import React from "react";

const BookingReport: React.FC = () => {
  const { isLoading, bookings, error } = useBookingss();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading bookings.</div>;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Booking Report</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border-b">Booking Date</th>
            <th className="px-4 py-2 border-b">Patient Name</th>
            <th className="px-4 py-2 border-b">Mobile Number</th>
          </tr>
        </thead>
        <tbody>
          {bookings?.map((booking) => (
            <tr key={booking.bookingId}>
              <td className="px-4 py-2 border-b">{booking.bookingDate}</td>
              <td className="px-4 py-2 border-b">
                {booking.patient.patientName}
              </td>
              <td className="px-4 py-2 border-b">
                {booking.patient.mobileNumber}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingReport;
