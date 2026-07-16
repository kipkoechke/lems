import axios from "../lib/axios";

/**
 * SHA "interventions" are the active lot services available through VEMS,
 * grouped by lot.
 */
export interface ShaInterventionService {
  id: string;
  code: string;
  name: string;
  tariff?: number | string | null;
  vendor_share?: number | string | null;
  facility_share?: number | string | null;
  capitated?: boolean;
  is_active?: boolean;
}

export interface ShaInterventionLot {
  lot: {
    id?: string;
    number?: string;
    name?: string;
  };
  services: ShaInterventionService[];
}

/**
 * The endpoint groups services under their lot. Shapes seen in the wild:
 *   { data: [ { lot: {...}, services: [...] } ] }
 *   { data: [ { id, number, name, services: [...] } ] }   // lot fields inline
 * Normalise both into ShaInterventionLot.
 */
const normaliseLot = (raw: unknown): ShaInterventionLot => {
  const item = (raw ?? {}) as Record<string, unknown>;

  if (item.lot && typeof item.lot === "object") {
    return {
      lot: item.lot as ShaInterventionLot["lot"],
      services: (item.services as ShaInterventionService[]) ?? [],
    };
  }

  return {
    lot: {
      id: item.id as string | undefined,
      number: item.number as string | undefined,
      name: item.name as string | undefined,
    },
    services: (item.services as ShaInterventionService[]) ?? [],
  };
};

// GET /sha/interventions
export const getShaInterventions = async (): Promise<ShaInterventionLot[]> => {
  const response = await axios.get<unknown>("/sha/interventions");
  const body = response.data as { data?: unknown };
  const raw = body?.data ?? response.data;

  if (!Array.isArray(raw)) return [];
  return raw.map(normaliseLot);
};
