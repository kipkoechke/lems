"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useMyVendor } from "@/features/vendors/useMyVendor";
import {
  useCreateVendorContact,
  useDeleteVendorContact,
  useUpdateVendorContact,
  useVendorContacts,
} from "@/features/vendors/useVendorContacts";
import {
  VendorContact,
  VendorContactCreateRequest,
} from "@/services/apiVendors";

const VENDOR_CONTACT_TYPES = [
  { value: "technical", label: "Technical" },
  { value: "support", label: "Support" },
  { value: "finance", label: "Finance" },
  { value: "general", label: "General" },
];
import { Table } from "@/components/Table";
import { ActionMenu } from "@/components/common/ActionMenu";
import { InputField } from "@/components/common/InputField";
import { SelectField } from "@/components/common/SelectField";
import { ErrorState } from "@/components/common/ErrorState";
import { SearchField } from "@/components/common/SearchField";
import { FaEdit, FaPlus, FaTrash, FaTimes, FaAddressBook } from "react-icons/fa";

const CONTACT_TYPE_BADGE: Record<string, string> = {
  technical: "bg-blue-50 text-blue-700 border-blue-200",
  support: "bg-purple-50 text-purple-700 border-purple-200",
  finance: "bg-emerald-50 text-emerald-700 border-emerald-200",
  general: "bg-slate-50 text-slate-700 border-slate-200",
};

function VendorContactsContent() {
  const { vendorId, missingVendorId, isLoading: vendorLoading } = useMyVendor();
  const { contacts, isLoading, error, refetch } = useVendorContacts(vendorId);
  const { createContact, isCreating } = useCreateVendorContact(vendorId);
  const { updateContact, isUpdating } = useUpdateVendorContact(vendorId);
  const { deleteContact, isDeleting } = useDeleteVendorContact(vendorId);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<VendorContact | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VendorContactCreateRequest>();

  const openCreate = () => {
    setEditing(null);
    reset({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      contact_type: "general",
      title: "",
      department: "",
      is_primary: false,
    });
    setShowModal(true);
  };

  const openEdit = (contact: VendorContact) => {
    setEditing(contact);
    reset({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone ?? "",
      contact_type: contact.contact_type,
      title: contact.title ?? "",
      department: contact.department ?? "",
      is_primary: contact.is_primary,
    });
    setShowModal(true);
  };

  const onSubmit = (data: VendorContactCreateRequest) => {
    if (editing) {
      updateContact(
        { contactId: editing.id, data },
        { onSuccess: () => setShowModal(false) },
      );
    } else {
      createContact(data, { onSuccess: () => setShowModal(false) });
    }
  };

  const filtered = contacts.filter((c) => {
    const term = search.toLowerCase();
    return (
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.title ?? "").toLowerCase().includes(term)
    );
  });

  if (vendorLoading || isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (missingVendorId) {
    return (
      <ErrorState
        title="Vendor Account Not Linked"
        message="Your account has no vendor linked to it, so we can't load your contacts. Sign out and back in, or ask an administrator to link your user to a vendor."
        fullScreen
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Contacts"
        error={error}
        action={{ label: "Try Again", onClick: () => refetch() }}
        fullScreen
      />
    );
  }

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 mb-2 md:mb-3 px-4 md:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaAddressBook className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Contacts</h1>
                <p className="text-sm text-slate-500">
                  Manage your vendor contacts
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full mx-auto">
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder="Search contacts by name, email or title..."
              />
            </div>

            <button
              onClick={openCreate}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <FaPlus className="w-3 h-3" /> Add Contact
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Phone</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell align="center">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.length === 0 ? (
                <Table.Empty colSpan={5}>
                  {search
                    ? "No contacts match your search"
                    : "No contacts yet. Add your first contact to get started."}
                </Table.Empty>
              ) : (
                filtered.map((contact) => (
                  <Table.Row key={contact.id}>
                    <Table.Cell>
                      <div className="font-medium text-slate-900">
                        {contact.first_name} {contact.last_name}
                        {contact.is_primary && (
                          <span className="ml-2 inline-flex px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800">
                            Primary
                          </span>
                        )}
                      </div>
                      {(contact.title || contact.department) && (
                        <div className="text-xs text-slate-500">
                          {[contact.title, contact.department]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {contact.email}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {contact.phone || "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                          CONTACT_TYPE_BADGE[contact.contact_type] ??
                          CONTACT_TYPE_BADGE.general
                        }`}
                      >
                        {contact.contact_type}
                      </span>
                    </Table.Cell>
                    <Table.Cell align="center">
                      <ActionMenu menuId={`contact-${contact.id}`}>
                        <ActionMenu.Trigger />
                        <ActionMenu.Content>
                          <ActionMenu.Item onClick={() => openEdit(contact)}>
                            <FaEdit className="text-amber-500" /> Edit
                          </ActionMenu.Item>
                          <ActionMenu.Item
                            onClick={() => setConfirmDelete(contact.id)}
                          >
                            <FaTrash className="text-red-500" /> Delete
                          </ActionMenu.Item>
                        </ActionMenu.Content>
                      </ActionMenu>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editing ? "Edit Contact" : "Add New Contact"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="First Name"
                    type="text"
                    placeholder="Enter first name"
                    register={register("first_name", { required: true })}
                    error={errors.first_name && "First name is required"}
                    required
                  />
                  <InputField
                    label="Last Name"
                    type="text"
                    placeholder="Enter last name"
                    register={register("last_name", { required: true })}
                    error={errors.last_name && "Last name is required"}
                    required
                  />
                </div>

                <InputField
                  label="Email"
                  type="email"
                  placeholder="Enter email address"
                  register={register("email", { required: true })}
                  error={errors.email && "Email is required"}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Phone"
                    type="text"
                    placeholder="Enter phone number"
                    register={register("phone")}
                  />
                  <SelectField
                    label="Contact Type"
                    required
                    register={register("contact_type", { required: true })}
                    error={errors.contact_type && "Contact type is required"}
                    placeholder="Select type"
                    options={VENDOR_CONTACT_TYPES}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Title"
                    type="text"
                    placeholder="e.g. Support Engineer"
                    register={register("title")}
                  />
                  <InputField
                    label="Department"
                    type="text"
                    placeholder="e.g. Technical"
                    register={register("department")}
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    {...register("is_primary")}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Primary contact
                  </span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isCreating || isUpdating
                      ? "Saving..."
                      : editing
                        ? "Update Contact"
                        : "Create Contact"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Delete Contact
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this contact? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  deleteContact(confirmDelete, {
                    onSuccess: () => setConfirmDelete(null),
                  })
                }
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VendorContactsPage() {
  return (
    <PermissionGate permission={Permission.VIEW_DASHBOARD}>
      <VendorContactsContent />
    </PermissionGate>
  );
}
