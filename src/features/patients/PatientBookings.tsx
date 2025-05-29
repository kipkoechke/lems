"use client";
import { useParams, useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaCalendar,
  FaChevronRight,
  FaPhone,
  FaUser,
} from "react-icons/fa";

// Mock booking data - replace with your actual API call
const mockBookingData = [
  {
    bookingId: "019716cf-671a-726b-aa16-55d84fa71ebf",
    cost: "11000",
    bookingDate: "2025-05-21 12:06:00",
    status: "Pending",
    notes: null,
    otpOverridden: "0",
    createdAt: "2025-05-28T12:13:00.000000Z",
    updatedAt: "2025-05-28T12:13:00.000000Z",
    deletedAt: null,
    patient: {
      patientId: "019714ab-7bd5-73e9-9d6c-0bfcf809440e",
      patientName: "Jane Doe",
      mobileNumber: "0782680815",
      dateOfBirth: "2025-05-28",
      createdAt: "2025-05-28T02:14:32.000000Z",
      updatedAt: "2025-05-28T02:14:32.000000Z",
      deletedAt: null,
    },
    facility: {
      facilityId: "01971667-41de-7034-b0eb-f920e2899518",
      facilityName: "South B Hospital",
      facilityCode: "47006",
      contactInfo: "Nairobi, kenya",
      createdAt: "2025-05-28T10:19:15.000000Z",
      updatedAt: "2025-05-28T10:19:15.000000Z",
      deleteddAt: null,
    },
    service: {
      serviceId: "0197167f-d5e3-71d0-99b6-a2f1840884cc",
      serviceName: "Radionucleide scan",
      description: "Nuclear Medicine",
      shaRate: "11000",
      vendorShare: "8000",
      facilityShare: "3000",
      capitated: "0",
      createdAt: "2025-05-28T10:46:06.000000Z",
      updatedAt: "2025-05-28T10:46:06.000000Z",
      deletedAt: null,
      category: {
        categoryId: "01971675-9c2e-7231-9eb7-37117c5366c7",
        lotNumber: "LOT 8",
        categoryName: "Nuclear Medicine",
        createdAt: "2025-05-28T10:34:55.000000Z",
        updatedAt: "2025-05-28T10:34:55.000000Z",
        deletedAt: null,
      },
    },
    equipment: {
      equipmentId: "01971695-e12d-722f-8aac-6c53161e92f3",
      equipmentName: "Nuclear Medicine Machine",
      serialNumber: "EQ5GVC9",
      status: "available",
      createdAt: "2025-05-28T11:10:10.000000Z",
      updatedAt: "2025-05-28T11:10:10.000000Z",
      deleteddAt: null,
      category: {
        vendorId: "0197166c-3402-7198-ba71-70d8a693eb5c",
        vendorName: "Megascope Healthcare Limited",
        vendorCode: "VEN002",
        contactInfo: "Nairobi, Kenya",
        createdAt: "2025-05-28T10:24:39.000000Z",
        updatedAt: "2025-05-28T10:24:39.000000Z",
        deleteddAt: null,
      },
      serviceIds:
        "0197167d-d706-70d2-b6b7-f77219d96f1b,0197167f-d5e3-71d0-99b6-a2f1840884cc",
    },
    paymentMode: {
      paymentModeId: "01971688-3b5d-73e2-a957-963328ecd81e",
      paymentModeName: "SHA",
      createdAt: "2025-05-28T10:55:16.000000Z",
      updatedAt: "2025-05-28T10:55:16.000000Z",
      deletedAt: null,
    },
  },
];

// Breadcrumb Component
function PatientBreadcrumb({ patient }: { patient: any }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center gap-2">
          <FaUser className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-900">
            {patient.patientName}
          </span>
        </div>
        <FaChevronRight className="w-4 h-4 text-gray-400" />
        <div className="flex items-center gap-2">
          <FaPhone className="w-4 h-4 text-green-600" />
          <span className="text-gray-600">{patient.mobileNumber}</span>
        </div>
        <FaChevronRight className="w-4 h-4 text-gray-400" />
        <div className="text-gray-600">ID: {patient.patientId.slice(-8)}</div>
      </div>
    </div>
  );
}

function PatientBookings() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  // In real implementation, fetch patient data and bookings based on patientId
  // const { patient, isLoading: patientLoading } = usePatient(patientId);
  // const { bookings, isLoading: bookingsLoading } = usePatientBookings(patientId);

  // Mock data for now
  const bookings = mockBookingData;
  const patient = bookings[0]?.patient; // Get patient data from booking

  const handleBackClick = () => {
    router.push("/patients");
  };

  return (
    <div className="p-6">
      {/* Header with back button */}
      <div className="mb-6">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to Patients
        </button>

        <h1 className="text-2xl font-bold text-gray-900">Patient Bookings</h1>
        <p className="text-gray-600 mt-1">Total: {bookings.length} bookings</p>
      </div>

      {/* Patient Breadcrumb */}
      {patient && <PatientBreadcrumb patient={patient} />}

      {/* Bookings Table */}
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <FaCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            No bookings found for this patient
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.bookingId} className="hover:bg-gray-50">
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {booking.bookingId.slice(-8)}
                      </div>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {booking.service.serviceName}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {booking.service.category.categoryName}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {booking.service.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {booking.facility.facilityName}
                        </div>
                        <div className="text-gray-500 text-xs">
                          Code: {booking.facility.facilityCode}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {booking.facility.contactInfo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {new Date(booking.bookingDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {new Date(booking.bookingDate).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "Completed"
                            ? "bg-blue-100 text-blue-800"
                            : booking.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">
                        KES {parseInt(booking.cost).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        SHA Rate:{" "}
                        {parseInt(booking.service.shaRate).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {booking.paymentMode.paymentModeName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {booking.equipment.equipmentName}
                        </div>
                        <div className="text-gray-500 text-xs">
                          Serial: {booking.equipment.serialNumber}
                        </div>
                        <div className="text-gray-400 text-xs">
                          Status:{" "}
                          <span
                            className={`${
                              booking.equipment.status === "available"
                                ? "text-green-600"
                                : booking.equipment.status === "in-use"
                                ? "text-orange-600"
                                : "text-red-600"
                            }`}
                          >
                            {booking.equipment.status}
                          </span>
                        </div>
                        <div className="text-gray-400 text-xs">
                          Vendor: {booking.equipment.category.vendorName}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientBookings;
