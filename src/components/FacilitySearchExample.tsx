// Example: Enhanced Facility Search Component
// This demonstrates how to use the new facility search functionality

import {
  useFacilitySearch,
  useFacilitySimpleSearch,
} from "@/features/facilities/useFacilities";
import {
  FacilityType,
  KephLevel,
  OperationStatus,
  Owner,
  RegulatoryStatus,
} from "@/services/apiFacility";
import React, { useState } from "react";

interface FacilitySearchExampleProps {
  onFacilitySelect?: (facilityId: string) => void;
}

export const FacilitySearchExample: React.FC<FacilitySearchExampleProps> = ({
  onFacilitySelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Advanced filter states
  const [facilityType, setFacilityType] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [operationStatus, setOperationStatus] = useState<string>("");
  const [regulatoryStatus, setRegulatoryStatus] = useState<string>("");
  const [kephLevel, setKephLevel] = useState<string>("");

  // Use simple search when no advanced filters are applied
  const { facilities: simpleResults, isLoading: simpleLoading } =
    useFacilitySimpleSearch(
      searchTerm && !showAdvancedFilters ? searchTerm : ""
    );

  // Use advanced search when filters are applied
  const { facilities: advancedResults, isLoading: advancedLoading } =
    useFacilitySearch(
      showAdvancedFilters ? searchTerm : "",
      showAdvancedFilters
        ? {
            facilityType: facilityType || undefined,
            owner: owner || undefined,
            operationStatus: operationStatus || undefined,
            regulatoryStatus: regulatoryStatus || undefined,
            kephLevel: kephLevel || undefined,
          }
        : undefined
    );

  const facilities = showAdvancedFilters ? advancedResults : simpleResults;
  const isLoading = showAdvancedFilters ? advancedLoading : simpleLoading;

  const clearFilters = () => {
    setFacilityType("");
    setOwner("");
    setOperationStatus("");
    setRegulatoryStatus("");
    setKephLevel("");
    setShowAdvancedFilters(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search facilities by name, code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
        >
          {showAdvancedFilters ? "Simple" : "Advanced"}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Advanced Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Facility Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility Type
              </label>
              <select
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {Object.values(FacilityType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Owner Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner
              </label>
              <select
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Owners</option>
                {Object.values(Owner).map((ownerType) => (
                  <option key={ownerType} value={ownerType}>
                    {ownerType}
                  </option>
                ))}
              </select>
            </div>

            {/* Operation Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operation Status
              </label>
              <select
                value={operationStatus}
                onChange={(e) => setOperationStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {Object.values(OperationStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Regulatory Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Regulatory Status
              </label>
              <select
                value={regulatoryStatus}
                onChange={(e) => setRegulatoryStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {Object.values(RegulatoryStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* KEPH Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                KEPH Level
              </label>
              <select
                value={kephLevel}
                onChange={(e) => setKephLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                {Object.values(KephLevel).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-2">
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">
              Searching facilities...
            </p>
          </div>
        )}

        {!isLoading && facilities.length === 0 && searchTerm && (
          <div className="text-center py-4 text-gray-500">
            No facilities found matching your search criteria
          </div>
        )}

        {!isLoading &&
          facilities.map((facility) => (
            <div
              key={facility.id}
              onClick={() => onFacilitySelect?.(facility.id)}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{facility.name}</h4>
                  <p className="text-sm text-gray-600">Code: {facility.code}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {facility.facility_type}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {facility.operation_status}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {facility.keph_level}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default FacilitySearchExample;
