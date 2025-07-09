import {
  FaBuilding,
  FaClinicMedical,
  FaHospital,
  FaStethoscope,
} from "react-icons/fa";
import {
  FacilityLink,
  facilitySearchPresets,
  useFacilityUrl,
} from "./FacilityLink";

/**
 * Example component demonstrating how to use facility search parameters
 * This can be used on dashboards, reports, or anywhere you need to link to filtered facility views
 */
export const FacilitySearchExamples = () => {
  const { createFacilityUrl } = useFacilityUrl();

  const handleProgrammaticNavigation = () => {
    // Example of programmatic navigation
    const url = createFacilityUrl({
      search: "cardiac",
      facility_type: "Hospital",
      operation_status: "Operational",
    });
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Facility Search Examples
      </h3>

      {/* Quick facility type links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <FacilityLink
          searchParams={facilitySearchPresets.hospitals}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
        >
          <FaHospital className="text-2xl text-blue-600 mb-2" />
          <span className="text-sm font-medium">Hospitals</span>
        </FacilityLink>

        <FacilityLink
          searchParams={facilitySearchPresets.healthCenters}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
        >
          <FaStethoscope className="text-2xl text-green-600 mb-2" />
          <span className="text-sm font-medium">Health Centers</span>
        </FacilityLink>

        <FacilityLink
          searchParams={facilitySearchPresets.clinics}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
        >
          <FaClinicMedical className="text-2xl text-purple-600 mb-2" />
          <span className="text-sm font-medium">Clinics</span>
        </FacilityLink>

        <FacilityLink
          searchParams={facilitySearchPresets.dispensaries}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors"
        >
          <FaBuilding className="text-2xl text-orange-600 mb-2" />
          <span className="text-sm font-medium">Dispensaries</span>
        </FacilityLink>
      </div>

      {/* Complex search examples */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">Complex Search Examples:</h4>

        <FacilityLink
          searchParams={{
            search: "maternity",
            facility_type: "Hospital",
            operation_status: "Operational",
          }}
          className="block p-3 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
        >
          🏥 Search for &quot;maternity&quot; in operational hospitals
        </FacilityLink>

        <FacilityLink
          searchParams={{
            owner: "Private",
            keph_level: "Level 4",
            regulatory_status: "Licensed",
          }}
          className="block p-3 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
        >
          🏢 Private Level 4 licensed facilities
        </FacilityLink>

        <FacilityLink
          searchParams={{
            search: "pediatric",
            owner: "Faith Based",
          }}
          className="block p-3 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors"
        >
          ⛪ Faith-based facilities with &quot;pediatric&quot; services
        </FacilityLink>
      </div>

      {/* Programmatic navigation example */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleProgrammaticNavigation}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Open Cardiac Hospitals (Programmatic)
        </button>
        <p className="text-sm text-gray-600 mt-2">
          Example of programmatic navigation using the useFacilityUrl hook
        </p>
      </div>
    </div>
  );
};

export default FacilitySearchExamples;
