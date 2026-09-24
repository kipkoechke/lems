"use client";

import { useMemo, useState } from "react";
import { FaSave, FaTimes, FaInfoCircle } from "react-icons/fa";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { InputField } from "@/components/common/InputField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  facilityEquipmentCreateSchema,
  FacilityEquipmentCreateFormData,
} from "@/lib/validations";
import {
  useCreateFacilityEquipment,
  useFacilityEquipments,
} from "./useFacilityEquipments";

interface AddFacilityEquipmentModalProps {
  onClose: () => void;
}

/**
 * Register a facility-owned unit.
 *
 * The API creates it by copying an existing unit: you identify the source by a
 * `contract_service_id` it provides, and everything else — model, brand,
 * category, specifications, and the services it offers in that lot — is copied
 * across. So the picker below is built from the services already mapped to the
 * facility's vendor equipment, which is exactly what the listing returns.
 */
export default function AddFacilityEquipmentModal({
  onClose,
}: AddFacilityEquipmentModalProps) {
  const [contractServiceId, setContractServiceId] = useState("");
  const { createEquipment, isCreating } = useCreateFacilityEquipment();

  // Vendor-supplied units are the ones that carry copyable contract services.
  const { equipments, isLoading } = useFacilityEquipments({
    ownership_type: "vendor",
    per_page: 100,
  });

  const serviceOptions = useMemo(() => {
    const options: {
      value: string;
      label: string;
      description: string;
    }[] = [];

    equipments.forEach((equipment) => {
      (equipment.mapped_services ?? []).forEach((service) => {
        if (!service.is_active) return;
        options.push({
          value: service.contract_service_id,
          label: `${service.name} (${service.code})`,
          description: [
            equipment.name,
            service.lot ? `LOT ${service.lot.number}` : null,
            equipment.vendor?.name,
          ]
            .filter(Boolean)
            .join(" • "),
        });
      });
    });

    return options;
  }, [equipments]);

  const selectedService = useMemo(
    () => serviceOptions.find((o) => o.value === contractServiceId),
    [serviceOptions, contractServiceId],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FacilityEquipmentCreateFormData>({
    resolver: zodResolver(facilityEquipmentCreateSchema),
  });

  const onSubmit = (values: FacilityEquipmentCreateFormData) => {
    if (!contractServiceId) return;

    createEquipment(
      {
        contract_service_id: contractServiceId,
        ae_title: values.ae_title,
        name: values.name || undefined,
        serial_number: values.serial_number || undefined,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Add Facility Equipment
            </h2>
            <p className="text-sm text-slate-500">
              Register a unit your facility owns
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="flex gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5 text-xs text-blue-800">
            <FaInfoCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <p>
              The new unit copies its model, brand, category and specifications
              from the equipment that currently provides the service you pick,
              and takes over that unit&apos;s services in the same lot. The
              vendor&apos;s own equipment is left untouched.
            </p>
          </div>

          <SearchableSelect
            label="Service this unit will provide"
            required
            options={serviceOptions}
            value={contractServiceId}
            onChange={setContractServiceId}
            placeholder={
              isLoading ? "Loading services..." : "Select a contracted service"
            }
            searchPlaceholder="Search by service name or code..."
            isLoading={isLoading}
          />

          {!isLoading && serviceOptions.length === 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              No contracted services are mapped to this facility yet, so there
              is no equipment to copy from. A vendor contract with mapped
              services is needed first.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="AE Title"
              type="text"
              placeholder="e.g. XRD01"
              register={register("ae_title")}
              error={errors.ae_title?.message}
              required
              disabled={isCreating}
            />

            <InputField
              label="Serial Number"
              type="text"
              placeholder="Optional — must be unique"
              register={register("serial_number")}
              error={errors.serial_number?.message}
              disabled={isCreating}
            />
          </div>

          <InputField
            label="Equipment Name"
            type="text"
            placeholder={
              selectedService
                ? "Leave blank to copy the source unit's name"
                : "Optional"
            }
            register={register("name")}
            disabled={isCreating}
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !contractServiceId}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <FaSave className="w-3.5 h-3.5" />
              {isCreating ? "Adding..." : "Add Equipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
