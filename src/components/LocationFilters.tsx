"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaSearch, FaGlobe } from "react-icons/fa";
import {
  useCounties,
  useSubCounties,
  useWards,
} from "@/features/counties/useCounties";
import { useFacilities } from "@/features/facilities/useFacilities";
import { County, SubCounty, Ward } from "@/services/apiCounty";
import { Facility } from "@/services/apiFacility";

interface LocationFiltersProps {
  onLocationChange: (filters: {
    county_id?: string;
    sub_county_id?: string;
    ward_id?: string;
    facility_id?: string;
  }) => void;
  showFacilityFilter?: boolean;
  className?: string;
}

const LocationFilters: React.FC<LocationFiltersProps> = ({
  onLocationChange,
  showFacilityFilter = true,
  className = "",
}) => {
  // State for selected values
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [selectedSubCounty, setSelectedSubCounty] = useState<SubCounty | null>(
    null
  );
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null
  );

  // Dropdown states
  const [isCountyDropdownOpen, setIsCountyDropdownOpen] = useState(false);
  const [isSubCountyDropdownOpen, setIsSubCountyDropdownOpen] = useState(false);
  const [isWardDropdownOpen, setIsWardDropdownOpen] = useState(false);
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);

  // Search states
  const [countySearch, setCountySearch] = useState("");
  const [subCountySearch, setSubCountySearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");
  const [facilitySearch, setFacilitySearch] = useState("");

  // Refs for dropdowns
  const countyDropdownRef = useRef<HTMLDivElement>(null);
  const subCountyDropdownRef = useRef<HTMLDivElement>(null);
  const wardDropdownRef = useRef<HTMLDivElement>(null);
  const facilityDropdownRef = useRef<HTMLDivElement>(null);

  // Data hooks
  const { counties, isLoading: countiesLoading } = useCounties();
  const { subCounties, isLoading: subCountiesLoading } = useSubCounties(
    selectedCounty?.code || ""
  );
  const { wards, isLoading: wardsLoading } = useWards(
    selectedSubCounty?.code || ""
  );
  const { facilities, isLoading: facilitiesLoading } = useFacilities(
    showFacilityFilter && selectedWard
      ? { ward_id: selectedWard.id }
      : undefined
  );

  // Filter data based on search
  const filteredCounties = counties?.filter((county) =>
    county.name.toLowerCase().includes(countySearch.toLowerCase())
  );

  const filteredSubCounties = subCounties?.filter((subCounty) =>
    subCounty.name.toLowerCase().includes(subCountySearch.toLowerCase())
  );

  const filteredWards = wards?.filter((ward) =>
    ward.name.toLowerCase().includes(wardSearch.toLowerCase())
  );

  const filteredFacilities = facilities?.filter((facility) =>
    facility.name.toLowerCase().includes(facilitySearch.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countyDropdownRef.current &&
        !countyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountyDropdownOpen(false);
      }
      if (
        subCountyDropdownRef.current &&
        !subCountyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSubCountyDropdownOpen(false);
      }
      if (
        wardDropdownRef.current &&
        !wardDropdownRef.current.contains(event.target as Node)
      ) {
        setIsWardDropdownOpen(false);
      }
      if (
        facilityDropdownRef.current &&
        !facilityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFacilityDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handlers
  const handleCountySelect = (county: County) => {
    setSelectedCounty(county);
    setSelectedSubCounty(null);
    setSelectedWard(null);
    setSelectedFacility(null);
    setIsCountyDropdownOpen(false);
    setCountySearch("");
    onLocationChange({ county_id: county.id });
  };

  const handleSubCountySelect = (subCounty: SubCounty) => {
    setSelectedSubCounty(subCounty);
    setSelectedWard(null);
    setSelectedFacility(null);
    setIsSubCountyDropdownOpen(false);
    setSubCountySearch("");
    onLocationChange({
      county_id: selectedCounty?.id,
      sub_county_id: subCounty.id,
    });
  };

  const handleWardSelect = (ward: Ward) => {
    setSelectedWard(ward);
    setSelectedFacility(null);
    setIsWardDropdownOpen(false);
    setWardSearch("");
    onLocationChange({
      county_id: selectedCounty?.id,
      sub_county_id: selectedSubCounty?.id,
      ward_id: ward.id,
    });
  };

  const handleFacilitySelect = (facility: Facility) => {
    setSelectedFacility(facility);
    setIsFacilityDropdownOpen(false);
    setFacilitySearch("");
    onLocationChange({
      county_id: selectedCounty?.id,
      sub_county_id: selectedSubCounty?.id,
      ward_id: selectedWard?.id,
      facility_id: facility.id,
    });
  };

  const clearAllSelections = () => {
    setSelectedCounty(null);
    setSelectedSubCounty(null);
    setSelectedWard(null);
    setSelectedFacility(null);
    setCountySearch("");
    setSubCountySearch("");
    setWardSearch("");
    setFacilitySearch("");
    onLocationChange({});
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaGlobe className="text-blue-500" />
          <h3 className="text-sm font-medium text-gray-700">
            Location Filters
          </h3>
        </div>
        <button
          onClick={clearAllSelections}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* County Dropdown */}
        <div className="relative" ref={countyDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsCountyDropdownOpen(!isCountyDropdownOpen);
              setIsSubCountyDropdownOpen(false);
              setIsWardDropdownOpen(false);
              setIsFacilityDropdownOpen(false);
            }}
            className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left bg-white flex items-center justify-between text-sm md:text-base"
          >
            <span
              className={selectedCounty ? "text-gray-900" : "text-gray-500"}
            >
              {countiesLoading
                ? "Loading counties..."
                : selectedCounty
                ? selectedCounty.name
                : "All Counties"}
            </span>
            <FaChevronDown
              className={`text-gray-400 transition-transform ${
                isCountyDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isCountyDropdownOpen && (
            <div className="absolute z-[9999] w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
              <div className="p-3 md:p-4 border-b border-gray-100">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search counties..."
                    value={countySearch}
                    onChange={(e) => setCountySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 md:py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm md:text-base"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <div
                  className="px-3 md:px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedCounty(null);
                    setSelectedSubCounty(null);
                    setSelectedWard(null);
                    setSelectedFacility(null);
                    setIsCountyDropdownOpen(false);
                    setCountySearch("");
                    onLocationChange({});
                  }}
                >
                  <div className="font-semibold text-gray-900 text-sm md:text-base">
                    All Counties
                  </div>
                </div>
                {filteredCounties && filteredCounties.length > 0 ? (
                  filteredCounties.map((county) => (
                    <div
                      key={county.id}
                      className="px-3 md:px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleCountySelect(county)}
                    >
                      <div className="font-semibold text-gray-900 text-sm md:text-base">
                        {county.name}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500">
                        Code: {county.code}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm md:text-base">
                    No counties found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sub County Dropdown */}
        <div className="relative" ref={subCountyDropdownRef}>
          <button
            type="button"
            onClick={() => {
              if (selectedCounty) {
                setIsSubCountyDropdownOpen(!isSubCountyDropdownOpen);
                setIsCountyDropdownOpen(false);
                setIsWardDropdownOpen(false);
                setIsFacilityDropdownOpen(false);
              }
            }}
            disabled={!selectedCounty}
            className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left bg-white flex items-center justify-between text-sm md:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <span
              className={selectedSubCounty ? "text-gray-900" : "text-gray-500"}
            >
              {!selectedCounty
                ? "Select county first"
                : subCountiesLoading
                ? "Loading sub counties..."
                : selectedSubCounty
                ? selectedSubCounty.name
                : "All Sub Counties"}
            </span>
            <FaChevronDown
              className={`text-gray-400 transition-transform ${
                isSubCountyDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isSubCountyDropdownOpen && selectedCounty && (
            <div className="absolute z-[9999] w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
              <div className="p-3 md:p-4 border-b border-gray-100">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search sub counties..."
                    value={subCountySearch}
                    onChange={(e) => setSubCountySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 md:py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm md:text-base"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <div
                  className="px-3 md:px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedSubCounty(null);
                    setSelectedWard(null);
                    setSelectedFacility(null);
                    setIsSubCountyDropdownOpen(false);
                    setSubCountySearch("");
                    onLocationChange({ county_id: selectedCounty.id });
                  }}
                >
                  <div className="font-semibold text-gray-900 text-sm md:text-base">
                    All Sub Counties
                  </div>
                </div>
                {filteredSubCounties && filteredSubCounties.length > 0 ? (
                  filteredSubCounties.map((subCounty) => (
                    <div
                      key={subCounty.id}
                      className="px-3 md:px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleSubCountySelect(subCounty)}
                    >
                      <div className="font-semibold text-gray-900 text-sm md:text-base">
                        {subCounty.name}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500">
                        Code: {subCounty.code}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm md:text-base">
                    No sub counties found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ward Dropdown */}
        <div className="relative" ref={wardDropdownRef}>
          <button
            type="button"
            onClick={() => {
              if (selectedSubCounty) {
                setIsWardDropdownOpen(!isWardDropdownOpen);
                setIsCountyDropdownOpen(false);
                setIsSubCountyDropdownOpen(false);
                setIsFacilityDropdownOpen(false);
              }
            }}
            disabled={!selectedSubCounty}
            className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left bg-white flex items-center justify-between text-sm md:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <span className={selectedWard ? "text-gray-900" : "text-gray-500"}>
              {!selectedSubCounty
                ? "Select sub county first"
                : wardsLoading
                ? "Loading wards..."
                : selectedWard
                ? selectedWard.name
                : "All Wards"}
            </span>
            <FaChevronDown
              className={`text-gray-400 transition-transform ${
                isWardDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isWardDropdownOpen && selectedSubCounty && (
            <div className="absolute z-[9999] w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
              <div className="p-3 md:p-4 border-b border-gray-100">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search wards..."
                    value={wardSearch}
                    onChange={(e) => setWardSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 md:py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm md:text-base"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <div
                  className="px-3 md:px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedWard(null);
                    setSelectedFacility(null);
                    setIsWardDropdownOpen(false);
                    setWardSearch("");
                    onLocationChange({
                      county_id: selectedCounty?.id,
                      sub_county_id: selectedSubCounty.id,
                    });
                  }}
                >
                  <div className="font-semibold text-gray-900 text-sm md:text-base">
                    All Wards
                  </div>
                </div>
                {filteredWards && filteredWards.length > 0 ? (
                  filteredWards.map((ward) => (
                    <div
                      key={ward.id}
                      className="px-3 md:px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleWardSelect(ward)}
                    >
                      <div className="font-semibold text-gray-900 text-sm md:text-base">
                        {ward.name}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500">
                        Code: {ward.code}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm md:text-base">
                    No wards found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Facility Dropdown */}
        {showFacilityFilter && (
          <div className="relative" ref={facilityDropdownRef}>
            <button
              type="button"
              onClick={() => {
                if (selectedWard) {
                  setIsFacilityDropdownOpen(!isFacilityDropdownOpen);
                  setIsCountyDropdownOpen(false);
                  setIsSubCountyDropdownOpen(false);
                  setIsWardDropdownOpen(false);
                }
              }}
              disabled={!selectedWard}
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left bg-white flex items-center justify-between text-sm md:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <span
                className={selectedFacility ? "text-gray-900" : "text-gray-500"}
              >
                {!selectedWard
                  ? "Select ward first"
                  : facilitiesLoading
                  ? "Loading facilities..."
                  : selectedFacility
                  ? selectedFacility.name
                  : "All Facilities"}
              </span>
              <FaChevronDown
                className={`text-gray-400 transition-transform ${
                  isFacilityDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isFacilityDropdownOpen && selectedWard && (
              <div className="absolute z-[9999] w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                <div className="p-3 md:p-4 border-b border-gray-100">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search facilities..."
                      value={facilitySearch}
                      onChange={(e) => setFacilitySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 md:py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm md:text-base"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div
                    className="px-3 md:px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedFacility(null);
                      setIsFacilityDropdownOpen(false);
                      setFacilitySearch("");
                      onLocationChange({
                        county_id: selectedCounty?.id,
                        sub_county_id: selectedSubCounty?.id,
                        ward_id: selectedWard.id,
                      });
                    }}
                  >
                    <div className="font-semibold text-gray-900 text-sm md:text-base">
                      All Facilities
                    </div>
                  </div>
                  {filteredFacilities && filteredFacilities.length > 0 ? (
                    filteredFacilities.map((facility) => (
                      <div
                        key={facility.id}
                        className="px-3 md:px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => handleFacilitySelect(facility)}
                      >
                        <div className="font-semibold text-gray-900 text-sm md:text-base">
                          {facility.name}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500">
                          Code: {facility.code}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm md:text-base">
                      No facilities found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationFilters;
