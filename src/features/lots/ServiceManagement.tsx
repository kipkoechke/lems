"use client";

import { Service } from "@/services/apiLots";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  FaArrowLeft,
  FaEdit,
  FaEllipsisV,
  FaEye,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { useCreateService } from "./useCreateService";
import { useDeleteService } from "./useDeleteService";
import { useLotWithServices } from "./useLotWithServices";
import { useUpdateService } from "./useUpdateService";

interface ServiceFormData {
  name: string;
  code: string;
  is_capitated: boolean;
  sha_rate: number;
  vendor_share: number;
  facility_share: number;
}

const ServiceManagement: React.FC = () => {
  const router = useRouter();
  const params = useParams();

  const lotNumber = params.lotNumber as string;

  const { lot, services, isLoading, error, refetch } =
    useLotWithServices(lotNumber);
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();

  // State management
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  // Form state
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    code: "",
    is_capitated: false,
    sha_rate: 0,
    vendor_share: 0,
    facility_share: 0,
  });

  // Filter services based on search and status for this lot
  const filteredServices =
    services?.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && service.is_active === "1") ||
        (statusFilter === "inactive" && service.is_active === "0");
      return matchesSearch && matchesStatus;
    }) || [];

  // Modal handlers
  const openModal = (type: "create" | "edit" | "view", service?: Service) => {
    setModalType(type);
    if (service) {
      setSelectedService(service);
      setFormData({
        name: service.name,
        code: service.code,
        is_capitated: service.is_capitated,
        sha_rate: service.sha_rate,
        vendor_share: service.vendor_share,
        facility_share: service.facility_share,
      });
    } else {
      setSelectedService(null);
      setFormData({
        name: "",
        code: "",
        is_capitated: false,
        sha_rate: 0,
        vendor_share: 0,
        facility_share: 0,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setFormData({
      name: "",
      code: "",
      is_capitated: false,
      sha_rate: 0,
      vendor_share: 0,
      facility_share: 0,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modalType === "create") {
        await createServiceMutation.mutateAsync({
          lot_id: lot?.id || "",
          ...formData,
        });
      } else if (modalType === "edit" && selectedService) {
        await updateServiceMutation.mutateAsync({
          id: selectedService.id,
          lot_id: lot?.id || "",
          ...formData,
        });
      }
      closeModal();
      refetch();
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  // Handle delete
  const handleDelete = async (serviceId: string) => {
    try {
      await deleteServiceMutation.mutateAsync(serviceId);
      setShowDeleteConfirm(null);
      refetch();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeDropdown &&
        !(event.target as Element).closest(".dropdown-container")
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center text-red-600">
              <h2 className="text-xl font-semibold mb-2">
                Error Loading Services
              </h2>
              <p>{error?.message || "Failed to load services"}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Service Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Managing services for lot:{" "}
                  <span className="font-semibold">
                    {lot?.name || "Loading..."}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => openModal("create")}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            >
              <FaPlus size={16} />
              Add Service
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "active" | "inactive"
                  )
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SHA Rate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor Share
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facility Share
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {searchTerm || statusFilter !== "all"
                        ? "No services found matching your criteria"
                        : "No services available. Create your first service to get started."}
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((service) => (
                    <tr
                      key={service.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {service.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {service.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {service.sha_rate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {service.vendor_share}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {service.facility_share}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            service.is_active === "1"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {service.is_active === "1" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative dropdown-container">
                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === service.id
                                  ? null
                                  : service.id
                              )
                            }
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <FaEllipsisV />
                          </button>
                          {activeDropdown === service.id && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setActiveDropdown(null)}
                              />
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-40 border border-gray-200">
                                <div className="py-1">
                                  <button
                                    onClick={() => openModal("view", service)}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                  >
                                    <FaEye className="text-blue-500" /> View
                                    Details
                                  </button>
                                  <button
                                    onClick={() => openModal("edit", service)}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                  >
                                    <FaEdit className="text-yellow-500" /> Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      setShowDeleteConfirm(service.id)
                                    }
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                                  >
                                    <FaTrash className="text-red-500" /> Delete
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {modalType === "create"
                    ? "Add New Service"
                    : modalType === "edit"
                    ? "Edit Service"
                    : "Service Details"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {modalType === "view" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Name
                    </label>
                    <p className="text-gray-900">{selectedService?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code
                    </label>
                    <p className="text-gray-900">{selectedService?.code}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capitated
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedService?.is_capitated
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedService?.is_capitated ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SHA Rate
                    </label>
                    <p className="text-gray-900">{selectedService?.sha_rate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor Share
                    </label>
                    <p className="text-gray-900">
                      {selectedService?.vendor_share}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facility Share
                    </label>
                    <p className="text-gray-900">
                      {selectedService?.facility_share}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedService?.is_active === "1"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedService?.is_active === "1"
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter service name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter service code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SHA Rate <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      required
                      value={formData.sha_rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sha_rate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter SHA rate"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Share <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      required
                      value={formData.vendor_share}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vendor_share: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter vendor share"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facility Share <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      required
                      value={formData.facility_share}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          facility_share: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter facility share"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_capitated"
                      checked={formData.is_capitated}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_capitated: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="is_capitated"
                      className="text-sm font-medium text-gray-700"
                    >
                      Capitated Service
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        createServiceMutation.isPending ||
                        updateServiceMutation.isPending
                      }
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createServiceMutation.isPending ||
                      updateServiceMutation.isPending
                        ? "Saving..."
                        : modalType === "create"
                        ? "Create Service"
                        : "Update Service"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Confirm Delete
              </h3>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this service? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deleteServiceMutation.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteServiceMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
