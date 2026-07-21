import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  configureEquipmentDicom,
  DicomConfigureRequest,
  getDicomModalities,
  getDicomServerStatus,
  getEquipmentDicomStatus,
  registerAllModalities,
  registerEquipmentModality,
  runWorklistTest,
  testEquipmentDicom,
  unregisterEquipmentModality,
} from "@/services/apiDicom";

export const useDicomServerStatus = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dicom", "server-status"],
    queryFn: getDicomServerStatus,
    // The Orthanc link is the thing operators watch; keep it reasonably fresh.
    refetchInterval: 30_000,
  });

  return { status: data, isLoading, error, refetch };
};

export const useDicomModalities = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dicom", "modalities"],
    queryFn: getDicomModalities,
  });

  return { modalities: data ?? [], isLoading, error, refetch };
};

export const useRegisterAllModalities = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: registerAllModalities,
    onSuccess: () => {
      toast.success("All modalities registered with Orthanc");
      queryClient.invalidateQueries({ queryKey: ["dicom"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(
        error?.response?.data?.message || "Failed to register modalities",
      ),
  });

  return { registerAll: mutate, isRegistering: isPending };
};

export const useEquipmentDicomStatus = (equipmentId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dicom", "equipment-status", equipmentId],
    queryFn: () => getEquipmentDicomStatus(equipmentId),
    enabled: !!equipmentId,
  });

  return { status: data, isLoading, error, refetch };
};

export const useConfigureEquipmentDicom = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      equipmentId,
      data,
    }: {
      equipmentId: string;
      data: DicomConfigureRequest;
    }) => configureEquipmentDicom(equipmentId, data),
    onSuccess: (result) => {
      // A 207 saves the details but fails Orthanc registration — say so plainly
      // rather than reporting a clean success.
      if (result?.registered === false) {
        toast.error(
          "DICOM details saved, but Orthanc registration failed. Check Orthanc is reachable.",
        );
      } else {
        toast.success("DICOM configured and registered with Orthanc");
      }
      queryClient.invalidateQueries({ queryKey: ["dicom"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || "Failed to configure DICOM"),
  });

  return { configureDicom: mutate, isConfiguring: isPending };
};

export const useTestEquipmentDicom = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: (equipmentId: string) => testEquipmentDicom(equipmentId),
    onSuccess: (result) => {
      const ok = result?.success ?? result?.connected;
      if (ok) {
        toast.success(result?.message || "C-ECHO succeeded — device reachable");
      } else {
        toast.error(result?.message || "C-ECHO failed — device unreachable");
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || "Connection test failed"),
  });

  return { testConnection: mutate, isTesting: isPending };
};

export const useWorklistTest = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: (equipmentId: string) => runWorklistTest(equipmentId),
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

export const useRegisterEquipmentModality = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (equipmentId: string) => registerEquipmentModality(equipmentId),
    onSuccess: () => {
      toast.success("Equipment registered as an Orthanc modality");
      queryClient.invalidateQueries({ queryKey: ["dicom"] });
    },
    onError: () => toast.error("Failed to register modality"),
  });

  return { registerModality: mutate, isRegistering: isPending };
};

export const useUnregisterEquipmentModality = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (equipmentId: string) =>
      unregisterEquipmentModality(equipmentId),
    onSuccess: () => {
      toast.success("Equipment unregistered from Orthanc");
      queryClient.invalidateQueries({ queryKey: ["dicom"] });
    },
    onError: () => toast.error("Failed to unregister modality"),
  });

  return { unregisterModality: mutate, isUnregistering: isPending };
};
