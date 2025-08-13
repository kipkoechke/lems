"use client";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import {
  useFacilitiesPaginated,
  useUpdateFacility,
} from "@/features/facilities/useFacilities";
import {
  useCounties,
  useSubCounties,
  useWards,
} from "@/features/counties/useCounties";
import {
  EditFacilityForm as EditFacility,
  Facility,
  KephLevel,
} from "@/services/apiFacility";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaBuilding,
  FaEdit,
  FaEllipsisV,
  FaEye,
  FaFileContract,
  FaSearch,
  FaStethoscope,
  FaUsers,
} from "react-icons/fa";

function EditFacilityForm({
  facility,
  onSuccess,
}: {
  facility: Facility;
  onSuccess: () => void;
}) {
  const { register, handleSubmit } = useForm<EditFacility>({
    defaultValues: {
      name: facility.name,
      code: facility.code,
    },
  });

  const { editFacility, isEditing } = useUpdateFacility();

  const onSubmit = (data: EditFacility) => {
    editFacility({ id: facility.id, data });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Edit Facility</h2>
        <p className="text-gray-600">Update facility information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facility Name
            </label>
            <input
              {...register("name", { required: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter facility name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facility Code
            </label>
            <input
              {...register("code", { required: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter facility code"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-6">
          <button
            type="button"
            onClick={() => onSuccess()}
            className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isEditing}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
          >
            {isEditing ? "Updating..." : "Update Facility"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FacilitiesContent() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Filter states
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedSubCounty, setSelectedSubCounty] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  // Location data hooks
  const { counties } = useCounties();
  const { subCounties } = useSubCounties(selectedCounty);
  const { wards } = useWards(selectedSubCounty);

  // Use facilities hook with filters
  const { isLoading, facilities, pagination, error } = useFacilitiesPaginated({
    page: currentPage,
    per_page: 100,
    search: searchTerm || undefined,
    county: selectedCounty || undefined,
    sub_county: selectedSubCounty || undefined,
    ward: selectedWard || undefined,
    keph_level: selectedLevel || undefined,
  });

  // Removed effect tied to location filters

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setActiveDropdown(null);
  };

  const handleCountyChange = (county: string) => {
    setSelectedCounty(county);
    setSelectedSubCounty(""); // Reset sub county when county changes
    setSelectedWard(""); // Reset ward when county changes
    setCurrentPage(1);
  };

  const handleSubCountyChange = (subCounty: string) => {
    setSelectedSubCounty(subCounty);
    setSelectedWard(""); // Reset ward when sub county changes
    setCurrentPage(1);
  };

  const handleWardChange = (ward: string) => {
    setSelectedWard(ward);
    setCurrentPage(1);
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedCounty || selectedSubCounty || selectedWard || selectedLevel;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8 text-center">
            <div className="text-red-500 text-lg md:text-xl mb-4">
              Error loading facilities: {error?.message || "Unknown error"}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const facilityData = facilities ?? [];
  const totalFacilities = pagination?.total ?? facilityData.length;

  // Show loading state or search results info
  const showEmptyState = !isLoading && facilityData.length === 0;
  const isSearchingOrFiltering = searchTerm.length > 0 || hasActiveFilters;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4 mb-4 md:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* County Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                County
              </label>
              <select
                value={selectedCounty}
                onChange={(e) => handleCountyChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Counties</option>
                {counties?.map((county) => (
                  <option key={county.id} value={county.code}>
                    {county.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub County Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub County
              </label>
              <select
                value={selectedSubCounty}
                onChange={(e) => handleSubCountyChange(e.target.value)}
                disabled={!selectedCounty}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">All Sub Counties</option>
                {subCounties?.map((subCounty) => (
                  <option key={subCounty.id} value={subCounty.code}>
                    {subCounty.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ward Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ward
              </label>
              <select
                value={selectedWard}
                onChange={(e) => handleWardChange(e.target.value)}
                disabled={!selectedSubCounty}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">All Wards</option>
                {wards?.map((ward) => (
                  <option key={ward.id} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                KEPH Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => handleLevelChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Levels</option>
                {Object.values(KephLevel).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search facilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-2 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaBuilding className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  {totalFacilities}
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Total Facilities
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaStethoscope className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  --
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Active Services
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FaFileContract className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  --
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Active Contracts
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm hidden md:block">
          {showEmptyState ? (
            <div className="p-12 text-center">
              <div className="text-gray-500 text-xl mb-4">
                {isSearchingOrFiltering
                  ? "No facilities match your search criteria"
                  : "No facilities found"}
              </div>
              <p className="text-gray-400">
                {isSearchingOrFiltering
                  ? "Try adjusting your search terms or filters"
                  : "Facilities will appear here once they are added to the system"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible shadow-sm rounded-2xl">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Facility
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Created Date
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {facilityData?.map((facility: Facility) => (
                    <tr
                      key={facility.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FaBuilding className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {facility.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {facility.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(facility.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === facility.id
                                  ? null
                                  : facility.id
                              )
                            }
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <FaEllipsisV />
                          </button>

                          {activeDropdown === facility.id && (
                            <>
                              {/* Backdrop to close dropdown */}
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setActiveDropdown(null)}
                              ></div>

                              {/* Dropdown menu */}
                              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
                                <div className="p-1">
                                  <button
                                    onClick={() => {
                                      router.push(
                                        `/facilities/${facility.code}`
                                      );
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                  >
                                    <FaEye className="text-blue-500" /> View
                                    Details
                                  </button>
                                  <Modal>
                                    <Modal.Open
                                      opens={`edit-facility-${facility.id}`}
                                    >
                                      <button
                                        onClick={() => {
                                          setActiveDropdown(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                      >
                                        <FaEdit className="text-green-500" />{" "}
                                        Edit Facility
                                      </button>
                                    </Modal.Open>
                                    <Modal.Window
                                      name={`edit-facility-${facility.id}`}
                                    >
                                      <EditFacilityForm
                                        facility={facility}
                                        onSuccess={() => {
                                          // Modal will auto-close
                                        }}
                                      />
                                    </Modal.Window>
                                  </Modal>
                                  <button
                                    onClick={() => {
                                      router.push(
                                        `/contracts?facility_code=${facility.code}`
                                      );
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                  >
                                    <FaFileContract className="text-purple-500" />{" "}
                                    View Contracts
                                  </button>
                                  <button
                                    onClick={() => {
                                      router.push(
                                        `/patients?facility_code=${facility.code}`
                                      );
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                  >
                                    <FaUsers className="text-indigo-500" /> View
                                    Patients
                                  </button>
                                  <button
                                    onClick={() => {
                                      router.push(
                                        `/services?facility_code=${facility.code}`
                                      );
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                  >
                                    <FaStethoscope className="text-orange-500" />{" "}
                                    View Services
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {showEmptyState ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
              <div className="text-lg mb-2">
                {isSearchingOrFiltering
                  ? "No facilities match your search criteria"
                  : "No facilities found"}
              </div>
              <p className="text-sm text-gray-400">
                {isSearchingOrFiltering
                  ? "Try adjusting your search terms or filters"
                  : "Facilities will appear here once they are added to the system"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {facilityData?.map((facility: Facility) => (
                <div
                  key={facility.id}
                  className="bg-white rounded-xl shadow-lg p-4 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaBuilding className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg truncate">
                          {facility.name}
                        </h3>
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                          {facility.code}
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === facility.id ? null : facility.id
                          )
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FaEllipsisV />
                      </button>

                      {activeDropdown === facility.id && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setActiveDropdown(null)}
                          ></div>
                          <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
                            <div className="p-1">
                              <button
                                onClick={() => {
                                  router.push(`/facilities/${facility.code}`);
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                              >
                                <FaEye className="text-blue-500" /> View Details
                              </button>
                              <button
                                onClick={() => {
                                  router.push(
                                    `/services?facility_code=${facility.code}`
                                  );
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                              >
                                <FaStethoscope className="text-orange-500" />{" "}
                                View Services
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(facility.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mobile Pagination */}
          {pagination && pagination.lastPage > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={pagination.currentPage}
                lastPage={pagination.lastPage}
                total={pagination.total}
                from={pagination.from}
                to={pagination.to}
                links={pagination.links}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        {/* Desktop Pagination */}
        {pagination && pagination.lastPage > 1 && (
          <div className="hidden md:block">
            <Pagination
              currentPage={pagination.currentPage}
              lastPage={pagination.lastPage}
              total={pagination.total}
              from={pagination.from}
              to={pagination.to}
              links={pagination.links}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Facilities() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <FacilitiesContent />
    </Suspense>
  );
}

export default Facilities;
