"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useCreateFacility } from "@/features/facilities/useCreateFacility";
import { CreateFacilityPayload } from "@/services/apiFacility";
import {
  getCounties,
  getSubCounties,
  getWards,
  County,
  SubCounty,
  Ward,
} from "@/services/apiCounty";
import { facilitySchema, FacilityFormData } from "@/lib/validations";
import { InputField } from "@/components/common/InputField";
import { SelectField } from "@/components/common/SelectField";

export default function NewFacilityPage() {
  const router = useRouter();
  const { createFacility, isCreating } = useCreateFacility();

  // Location data
  const [counties, setCounties] = useState<County[]>([]);
  const [subCounties, setSubCounties] = useState<SubCounty[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
    mode: "onBlur",
  });

  const selectedCounty = watch("county_id");
  const selectedSubCounty = watch("sub_county_id");

  // Load counties on component mount
  useEffect(() => {
    const loadCounties = async () => {
      setLoadingLocations(true);
      try {
        const data = await getCounties();
        setCounties(data);
      } catch (error) {
        console.error("Error loading counties:", error);
      } finally {
        setLoadingLocations(false);
      }
    };
    loadCounties();
  }, []);

  // Load sub-counties when county changes
  useEffect(() => {
    if (selectedCounty) {
      const loadSubCounties = async () => {
        setLoadingLocations(true);
        try {
          const county = counties.find((c) => c.id === selectedCounty);
          if (county) {
            const data = await getSubCounties(county.code);
            setSubCounties(data);
          }
          // Reset dependent fields
          setValue("sub_county_id", "");
          setValue("ward_code", "");
          setWards([]);
        } catch (error) {
          console.error("Error loading sub-counties:", error);
        } finally {
          setLoadingLocations(false);
        }
      };
      loadSubCounties();
    } else {
      setSubCounties([]);
      setWards([]);
      setValue("sub_county_id", "");
      setValue("ward_code", "");
    }
  }, [selectedCounty, counties, setValue]);

  // Load wards when sub-county changes
  useEffect(() => {
    if (selectedSubCounty) {
      const loadWards = async () => {
        setLoadingLocations(true);
        try {
          const subCounty = subCounties.find(
            (sc) => sc.id === selectedSubCounty
          );
          if (subCounty) {
            const data = await getWards(subCounty.code);
            setWards(data);
          }
          // Reset ward field
          setValue("ward_code", "");
        } catch (error) {
          console.error("Error loading wards:", error);
        } finally {
          setLoadingLocations(false);
        }
      };
      loadWards();
    } else {
      setWards([]);
      setValue("ward_code", "");
    }
  }, [selectedSubCounty, subCounties, setValue]);

  const onSubmit = (data: FacilityFormData) => {
    // Find the ward object to get the ward code
    const selectedWard = wards.find((w) => w.id === data.ward_code);
    if (!selectedWard) {
      console.error("Please select a valid ward");
      return;
    }

    // Prepare payload matching the API structure
    const payload: CreateFacilityPayload = {
      name: data.name,
      code: data.code,
      ward_code: selectedWard.code, // Use ward code, not ID
      regulatory_status: data.regulatory_status || undefined,
      facility_type: data.facility_type || undefined,
      owner: data.owner || undefined,
      keph_level: data.keph_level || undefined,
      operation_status: data.operation_status || undefined,
      dha_pass_id: data.dha_pass_id || undefined,
      dha_username: data.dha_username || undefined,
      dha_code: data.dha_code || undefined,
      dha_agent: data.dha_agent || undefined,
      dha_key: data.dha_key || undefined,
      dha_secret: data.dha_secret || undefined,
      public_key: data.public_key || undefined,
      private_key: data.private_key || undefined,
    };

    createFacility(payload, {
      onSuccess: () => {
        router.push("/facilities");
      },
    });
  };

  return (
    <PermissionGate
      permission={Permission.ONBOARD_FACILITY}
      fallback={
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You don&apos;t have permission to create facilities.
            </p>
            <Link
              href="/facilities"
              className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
            >
              Back to Facilities
            </Link>
          </div>
        </div>
      }
    >
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/facilities" className="hover:text-blue-600">
              Facilities
            </Link>
            <span>/</span>
            <span className="text-gray-900">New Facility</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Facility</h1>
          <p className="text-gray-600 mt-2">
            Create a new healthcare facility in the system
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <InputField
                    label="Facility Name"
                    type="text"
                    placeholder="Enter facility name"
                    register={register("name")}
                    error={errors.name?.message}
                    required
                    disabled={isCreating}
                  />
                </div>

                <div>
                  <InputField
                    label="Facility Code"
                    type="text"
                    placeholder="Enter facility code"
                    register={register("code")}
                    error={errors.code?.message}
                    required
                    disabled={isCreating}
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <SelectField
                    label="County"
                    register={register("county_id")}
                    error={errors.county_id?.message}
                    required
                    disabled={loadingLocations || isCreating}
                    placeholder="Select County"
                    options={counties.map((county) => ({
                      value: county.id,
                      label: county.name,
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub County *
                  </label>
                  <select
                    {...register("sub_county_id", {
                      required: "Sub county is required",
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loadingLocations || !selectedCounty}
                  >
                    <option value="">Select Sub County</option>
                    {subCounties.map((subCounty) => (
                      <option key={subCounty.id} value={subCounty.id}>
                        {subCounty.name}
                      </option>
                    ))}
                  </select>
                  {errors.sub_county_id && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.sub_county_id.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ward *
                  </label>
                  <select
                    {...register("ward_code", {
                      required: "Ward is required",
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loadingLocations || !selectedSubCounty}
                  >
                    <option value="">Select Ward</option>
                    {wards.map((ward) => (
                      <option key={ward.id} value={ward.id}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                  {errors.ward_code && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.ward_code.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Facility Classification */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Facility Classification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facility Type
                  </label>
                  <select
                    {...register("facility_type")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Facility Type</option>
                    <option value="Dispensary">Dispensary</option>
                    <option value="Health Center">Health Center</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Medical Center">Medical Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    KEPH Level
                  </label>
                  <select
                    {...register("keph_level")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select KEPH Level</option>
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                    <option value="4">Level 4</option>
                    <option value="5">Level 5</option>
                    <option value="6">Level 6</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner
                  </label>
                  <select
                    {...register("owner")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Owner</option>
                    <option value="Ministry of Health">
                      Ministry of Health
                    </option>
                    <option value="Private">Private</option>
                    <option value="Faith Based">Faith Based</option>
                    <option value="NGO">NGO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Regulatory Status
                  </label>
                  <select
                    {...register("regulatory_status")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Regulatory Status</option>
                    <option value="Pending Registration">
                      Pending Registration
                    </option>
                    <option value="Licensed">Licensed</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Revoked">Revoked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operation Status
                  </label>
                  <select
                    {...register("operation_status")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Operation Status</option>
                    <option value="Operational">Operational</option>
                    <option value="Non-Operational">Non-Operational</option>
                    <option value="Temporarily Closed">
                      Temporarily Closed
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* DHA Credentials */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                DHA Credentials (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <InputField
                    label="DHA Pass ID"
                    type="text"
                    placeholder="Enter DHA Pass ID"
                    register={register("dha_pass_id")}
                    error={errors.dha_pass_id?.message}
                    disabled={isCreating}
                  />
                </div>

                <div>
                  <InputField
                    label="DHA Username"
                    type="text"
                    placeholder="Enter DHA Username"
                    register={register("dha_username")}
                    error={errors.dha_username?.message}
                    disabled={isCreating}
                  />
                </div>

                <div>
                  <InputField
                    label="DHA Code"
                    type="text"
                    placeholder="Enter DHA Code"
                    register={register("dha_code")}
                    error={errors.dha_code?.message}
                    disabled={isCreating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DHA Agent
                  </label>
                  <input
                    type="text"
                    {...register("dha_agent")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter DHA Agent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DHA Key
                  </label>
                  <input
                    type="password"
                    {...register("dha_key")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter DHA Key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DHA Secret
                  </label>
                  <input
                    type="password"
                    {...register("dha_secret")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter DHA Secret"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Public Key
                  </label>
                  <textarea
                    {...register("public_key")}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Public Key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Private Key
                  </label>
                  <textarea
                    {...register("private_key")}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Private Key"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push("/facilities")}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Facility"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGate>
  );
}
