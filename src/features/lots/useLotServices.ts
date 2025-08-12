import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface LotService {
  id: string;
  name: string;
  code: string;
  sha_rate: string;
  facility_share: string;
  vendor_share: string;
  is_capitated: string;
  lot_id: string;
  is_active: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Lot {
  id: string;
  number: string;
  name: string;
  is_active: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface LotServicesResponse {
  lot: Lot;
  services: LotService[];
}

const fetchLotServices = async (lotNumber: string): Promise<LotService[]> => {
  const response = await axios.get<LotServicesResponse>(
    `/lots?lot_number=${lotNumber}`
  );
  return response.data.services || [];
};

export const useLotServices = (lotNumber: string) => {
  return useQuery({
    queryKey: ["lot-services", lotNumber],
    queryFn: () => fetchLotServices(lotNumber),
    enabled: !!lotNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
