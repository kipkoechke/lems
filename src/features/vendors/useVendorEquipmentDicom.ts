import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  configureVendorEquipmentDicom,
  getVendorEquipmentDicomStatus,
  runVendorWorklistTest,
  testVendorEquipmentConnection,
  VendorDicomConfigureRequest,
} from "@/services/apiEquipment";

const dicomKey = (equipmentId: string) => [
  "vendor-equipment-dicom",
  equipmentId,
];

// GET /vendor/equipments/{id}/dicom-status
export const useVendorEquipmentDicomStatus = (equipmentId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: dicomKey(equipmentId),
    queryFn: () => getVendorEquipmentDicomStatus(equipmentId),
    enabled: !!equipmentId,
  });

  return { dicom: data, isLoading, error, refetch };
};

// POST /vendor/equipments/{id}/configure
export const useConfigureVendorEquipmentDicom = (equipmentId: string) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VendorDicomConfigureRequest) =>
      configureVendorEquipmentDicom(equipmentId, data),
    onSuccess: (result) => {
      // Details can save while Orthanc registration fails — report that
      // honestly instead of a blanket success.
      if (result?.registered === false) {
        toast.error(
          "Saved, but Orthanc registration failed. Check the device is reachable.",
        );
      } else {
        toast.success(result?.message || "DICOM configured and registered");
      }
      queryClient.invalidateQueries({ queryKey: dicomKey(equipmentId) });
      queryClient.invalidateQueries({ queryKey: ["vendorEquipment"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || "Failed to configure DICOM"),
  });

  return { configureDicom: mutate, isConfiguring: isPending };
};

// POST /vendor/equipments/{id}/test-connection
export const useTestVendorEquipmentConnection = (equipmentId: string) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => testVendorEquipmentConnection(equipmentId),
    onSuccess: (result) => {
      const ok = result?.success ?? result?.is_connected ?? result?.connected;
      if (ok) {
        toast.success(result?.message || "C-ECHO succeeded — device reachable");
      } else {
        toast.error(result?.message || "C-ECHO failed — device unreachable");
      }
      queryClient.invalidateQueries({ queryKey: dicomKey(equipmentId) });
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || "Connection test failed"),
  });

  return { testConnection: mutate, isTesting: isPending };
};

// POST /vendor/worklist-test
export const useVendorWorklistTest = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: (equipmentId?: string) => runVendorWorklistTest(equipmentId),
    onSuccess: (result) => {
      if (result?.success === false) {
        toast.error(result?.message || "Worklist test failed");
      } else {
        toast.success(result?.message || "Test worklist created in Orthanc");
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || "Worklist test failed"),
  });

  return { runWorklistTest: mutate, isRunningTest: isPending };
};
