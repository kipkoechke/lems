import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

interface LotService {
  id: string;
  service_code: string;
  service_name: string;
  is_active: string;
  lot_id: string;
  lot_number: string;
}

interface LotServicesResponse {
  data: LotService[];
}

const fetchLotServices = async (lotNumber: string): Promise<LotService[]> => {
  const response = await axios.get<LotServicesResponse>(
    `/lots?lot_number=${lotNumber}`
  );
  return response.data.data || [];
};

export const useLotServices = (lotNumber: string) => {
  return useQuery({
    queryKey: ["lot-services", lotNumber],
    queryFn: () => fetchLotServices(lotNumber),
    enabled: !!lotNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
