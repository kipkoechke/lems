"use client";

import { useMemo, useState } from "react";
import { SearchableSelect } from "./SearchableSelect";
import { useFacilities } from "@/features/facilities/useFacilities";
import { useDebounce } from "@/hooks/useDebounce";
import type { Facility } from "@/services/apiFacility";

interface FacilityFilterProps {
  /** Selected facility id, or "" for no filter. */
  value: string;
  onChange: (facilityId: string, facility?: Facility) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  /** Hide the field label, for filter rows that align controls on one line. */
  hideLabel?: boolean;
}

/**
 * Facility picker for list filters.
 *
 * Searching runs server-side (`/facilities?search=`), because the register is
 * far larger than any single page of options.
 */
export const FacilityFilter: React.FC<FacilityFilterProps> = ({
  value,
  onChange,
  label = "Facility",
  placeholder = "All facilities",
  className = "",
  hideLabel = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  const { facilities, isLoading } = useFacilities(
    debouncedSearch ? { search: debouncedSearch } : { per_page: 100 },
  );

  // Remember the chosen facility so its label survives a later search that no
  // longer returns it — otherwise the closed select renders blank.
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null,
  );

  const options = useMemo(() => {
    const list = [...facilities];
    if (
      selectedFacility &&
      !list.some((facility) => facility.id === selectedFacility.id)
    ) {
      list.unshift(selectedFacility);
    }
    return list.map((facility) => ({
      value: facility.id,
      label: facility.name,
      description: [facility.code, facility.county?.name]
        .filter(Boolean)
        .join(" • "),
    }));
  }, [facilities, selectedFacility]);

  return (
    <div className={`${hideLabel ? "[&>div>label]:hidden" : ""} ${className}`}>
      <SearchableSelect
        label={label}
        placeholder={placeholder}
        searchPlaceholder="Search facility by name or code..."
        options={options}
        value={value}
        isLoading={isLoading}
        onSearchChange={setSearchTerm}
        onChange={(facilityId) => {
          const facility = facilities.find((f) => f.id === facilityId);
          setSelectedFacility(
            facility ?? (facilityId ? selectedFacility : null),
          );
          onChange(facilityId, facility);
        }}
      />
    </div>
  );
};

export default FacilityFilter;
