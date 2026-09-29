"use client";

import { SearchableSelect } from "./SearchableSelect";
import { useLots } from "@/features/lots/useLots";
import { useLotServices } from "@/features/lots/useLotServices";

interface LotServiceFilterProps {
  lotId: string;
  onLotChange: (lotId: string) => void;
  serviceId: string;
  onServiceChange: (serviceId: string) => void;
  className?: string;
}

/**
 * Lot, and optionally one service within it.
 *
 * The two are a pair: the service list is only knowable once a lot is chosen,
 * so the service select appears after one is and clears itself when the lot
 * changes — a `lot_service_id` from a different lot would return nothing and
 * look like an empty result rather than a stale filter.
 */
export const LotServiceFilter: React.FC<LotServiceFilterProps> = ({
  lotId,
  onLotChange,
  serviceId,
  onServiceChange,
  className = "w-full lg:w-48",
}) => {
  // Unpaginated: the register is small, and a partially loaded filter would
  // silently omit lots.
  const { lots } = useLots(undefined);
  const { services, isLoading: servicesLoading } = useLotServices(lotId);

  return (
    <>
      <SearchableSelect
        label=""
        compact
        className={className}
        value={lotId}
        onChange={(value) => {
          onLotChange(value);
          // The chosen service belongs to the old lot.
          if (serviceId) onServiceChange("");
        }}
        placeholder="All lots"
        searchPlaceholder="Search lots..."
        options={lots.map((lot) => ({
          value: lot.id,
          label: `LOT ${lot.number} — ${lot.name}`,
        }))}
      />

      {!!lotId && (
        <SearchableSelect
          label=""
          compact
          className={className}
          value={serviceId}
          onChange={onServiceChange}
          placeholder={
            servicesLoading ? "Loading services..." : "All services in lot"
          }
          searchPlaceholder="Search services..."
          isLoading={servicesLoading}
          options={services.map((service) => ({
            value: service.id,
            label: service.name,
            description: service.code,
          }))}
        />
      )}
    </>
  );
};
