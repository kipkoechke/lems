"use client";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useCurrentUser } from "@/hooks/useAuth";
import { useState } from "react";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import { SearchField } from "@/components/common/SearchField";

// Mock payment data - replace with actual API integration
const mockPayments = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    amount: 150000,
    status: "paid",
    date: "2024-01-10",
    description: "Equipment maintenance - January",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    amount: 75000,
    status: "pending",
    date: "2024-01-15",
    description: "Service fees - CT Scan",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    amount: 200000,
    status: "overdue",
    date: "2024-01-05",
    description: "Equipment lease - MRI Machine",
  },
];

export default function PaymentsPage() {
  const user = useCurrentUser();
  const [searchTerm, setSearchTerm] = useState("");

  const isVendor = user?.role === "vendor";

  // Filter payments based on search
  const filteredPayments = mockPayments.filter(
    (payment) =>
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalPaid = mockPayments
    .filter((p) => p.status === "paid")
    .reduce((acc, p) => acc + p.amount, 0);
  const totalPending = mockPayments
    .filter((p) => p.status === "pending")
    .reduce((acc, p) => acc + p.amount, 0);
  const totalOverdue = mockPayments
    .filter((p) => p.status === "overdue")
    .reduce((acc, p) => acc + p.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" /> Paid
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaClock className="mr-1" /> Pending
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaExclamationTriangle className="mr-1" /> Overdue
          </span>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  return (
    <PermissionGate permission={Permission.VIEW_PAYMENTS}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl mb-4 md:mb-6">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 px-4 md:px-8 py-4 md:py-6 rounded-t-xl md:rounded-t-2xl">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaMoneyBillWave className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                    {isVendor ? "Revenue & Payments" : "Payment Status"}
                  </h1>
                  <p className="text-sm md:text-base text-green-100">
                    {isVendor
                      ? "Track your revenue, payments and pending amounts"
                      : "View facility payment status and arrears"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="p-4 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        {isVendor ? "Total Received" : "Total Paid"}
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(totalPaid)}
                      </p>
                    </div>
                    <FaCheckCircle className="w-10 h-10 text-green-400 opacity-50" />
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">
                        Pending
                      </p>
                      <p className="text-2xl font-bold text-yellow-700">
                        {formatCurrency(totalPending)}
                      </p>
                    </div>
                    <FaClock className="w-10 h-10 text-yellow-400 opacity-50" />
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">
                        {isVendor ? "Outstanding" : "Arrears"}
                      </p>
                      <p className="text-2xl font-bold text-red-700">
                        {formatCurrency(totalOverdue)}
                      </p>
                    </div>
                    <FaExclamationTriangle className="w-10 h-10 text-red-400 opacity-50" />
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="mb-6">
                <SearchField
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search by invoice number or description..."
                />
              </div>

              {/* Payments Table */}
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {payment.invoiceNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {payment.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(payment.date).toLocaleDateString("en-KE")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(payment.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredPayments.length === 0 && (
                  <div className="text-center py-12">
                    <FaMoneyBillWave className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No payments found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
