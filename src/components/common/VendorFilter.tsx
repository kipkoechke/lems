"use client";

import { useMemo } from "react";
import { SearchableSelect } from "./SearchableSelect";
import { useVendors } from "@/features/vendors/useVendors";

interface VendorFilterProps {
  /** Selected vendor id, or "" for no filter. */
  value: string;
  onChange: (vendorId: string) => void;
  label?: string;
  placeholder?: string;
  /** Hide the field label, for filter rows that align controls on one line. */
  hideLabel?: boolean;
}

/**
 * Vendor picker for list filters.
 *
 * Unlike facilities, the vendor register is small enough to load in one page,
 * so the search here is client-side within the loaded options.
 */
export const VendorFilter: React.FC<VendorFilterProps> = ({
  value,
  onChange,
  label = "Vendor",
  placeholder = "All vendors",
  hideLabel = false,
}) => {
  const { vendors, isLoading } = useVendors();

  const options = useMemo(
    () =>
      vendors.map((vendor) => ({
        value: vendor.id,
        label: vendor.name,
        description: vendor.code,
      })),
    [vendors],
  );

  return (
    <SearchableSelect
      label={hideLabel ? "" : label}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={isLoading ? "Loading vendors..." : placeholder}
      searchPlaceholder="Search vendors..."
      isLoading={isLoading}
    />
  );
};
