import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  createVendorContact,
  deleteVendorContact,
  getVendorContacts,
  updateVendorContact,
  VendorContactPayload,
} from "@/services/apiVendorContacts";

const contactsKey = (vendorId: string) => ["vendor-contacts", vendorId];

export const useVendorContacts = (vendorId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: contactsKey(vendorId),
    queryFn: () => getVendorContacts(vendorId),
    enabled: !!vendorId,
  });

  return { contacts: data ?? [], isLoading, error, refetch };
};

export const useCreateVendorContact = (vendorId: string) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VendorContactPayload) =>
      createVendorContact(vendorId, data),
    onSuccess: () => {
      toast.success("Contact added successfully");
      queryClient.invalidateQueries({ queryKey: contactsKey(vendorId) });
    },
    onError: () => toast.error("Failed to add contact"),
  });

  return { createContact: mutate, isCreating: isPending };
};

export const useUpdateVendorContact = (vendorId: string) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      contactId,
      data,
    }: {
      contactId: string;
      data: Partial<VendorContactPayload>;
    }) => updateVendorContact(vendorId, contactId, data),
    onSuccess: () => {
      toast.success("Contact updated successfully");
      queryClient.invalidateQueries({ queryKey: contactsKey(vendorId) });
    },
    onError: () => toast.error("Failed to update contact"),
  });

  return { updateContact: mutate, isUpdating: isPending };
};

export const useDeleteVendorContact = (vendorId: string) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (contactId: string) => deleteVendorContact(vendorId, contactId),
    onSuccess: () => {
      toast.success("Contact deleted successfully");
      queryClient.invalidateQueries({ queryKey: contactsKey(vendorId) });
    },
    onError: () => toast.error("Failed to delete contact"),
  });

  return { deleteContact: mutate, isDeleting: isPending };
};
