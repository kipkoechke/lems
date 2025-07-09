import {
  buildUrlSearchParams,
  FacilityQueryParams,
} from "@/services/apiFacility";
import Link from "next/link";

interface FacilityLinkProps {
  searchParams?: Partial<FacilityQueryParams>;
  children: React.ReactNode;
  className?: string;
}

/**
 * A component that creates a link to the facilities page with specific search parameters
 *
 * @example
 * // Link to facilities with a search term
 * <FacilityLink searchParams={{ search: "hospital" }}>
 *   View Hospitals
 * </FacilityLink>
 *
 * @example
 * // Link to facilities with multiple filters
 * <FacilityLink searchParams={{
 *   facility_type: "Hospital",
 *   county_id: "123",
 *   search: "cardiac"
 * }}>
 *   View Cardiac Hospitals in County
 * </FacilityLink>
 */
export const FacilityLink: React.FC<FacilityLinkProps> = ({
  searchParams = {},
  children,
  className = "",
}) => {
  const queryString = buildUrlSearchParams(searchParams);
  const href = queryString ? `/facilities?${queryString}` : "/facilities";

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};

/**
 * Hook to generate facility URLs with search parameters
 */
export const useFacilityUrl = () => {
  const createFacilityUrl = (
    searchParams: Partial<FacilityQueryParams> = {}
  ) => {
    const queryString = buildUrlSearchParams(searchParams);
    return queryString ? `/facilities?${queryString}` : "/facilities";
  };

  return { createFacilityUrl };
};

/**
 * Common facility search presets
 */
export const facilitySearchPresets = {
  hospitals: { facility_type: "Hospital" },
  healthCenters: { facility_type: "Health Center" },
  dispensaries: { facility_type: "Dispensary" },
  clinics: { facility_type: "Clinic" },
  privateOwned: { owner: "Private" },
  governmentOwned: { owner: "Ministry of Health" },
  faithBased: { owner: "Faith Based" },
  operational: { operation_status: "Operational" },
  licensed: { regulatory_status: "Licensed" },
  level1: { keph_level: "Level 1" },
  level2: { keph_level: "Level 2" },
  level3: { keph_level: "Level 3" },
  level4: { keph_level: "Level 4" },
  level5: { keph_level: "Level 5" },
  level6: { keph_level: "Level 6" },
} as const;

export default FacilityLink;
