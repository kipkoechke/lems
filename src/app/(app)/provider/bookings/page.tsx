"use client";


import { useSearchControl } from "@/hooks/useSearchControl";
import { useRouter } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useProviderBookings } from "@/features/provider/useProvider";
import { Table } from "@/components/Table";
import { SearchField } from "@/components/common/SearchField";
import { ErrorState } from "@/components/common/ErrorState";
import { FaHospitalUser } from "react-icons/fa";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  pending_otp: "bg-amber-50 text-amber-700 border-amber-200",
};

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

function ProviderBookingsContent() {
  const router = useRouter();
  const search = useSearchControl();
  const { bookings, isLoading, error, refetch } = useProviderBookings();

  const filtered = bookings.filter((b) => {
    const term = search.term.toLowerCase();
    if (!term) return true;
    return (
      b.booking_number?.toLowerCase().includes(term) ||
      b.visit_id?.toLowerCase().includes(term) ||
      b.patient?.name?.toLowerCase().includes(term)
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Provider Bookings"
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
                <FaHospitalUser className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Provider Bookings
                </h1>
                <p className="text-sm text-slate-500">
                  {bookings.length} bookings created via the provider portal
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full mx-auto">
              <SearchField
                value={search.input}
                onChange={search.onInputChange}
                onSearch={search.submit}
                onClear={search.clear}
                placeholder="Search by booking number, visit ID or patient..."
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Booking #</Table.HeaderCell>
                  <Table.HeaderCell>Visit ID</Table.HeaderCell>
                  <Table.HeaderCell>Patient</Table.HeaderCell>
                  <Table.HeaderCell>Claim ID</Table.HeaderCell>
                  <Table.HeaderCell>Services</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Created</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filtered.length === 0 ? (
                  <Table.Empty colSpan={7}>
                    {search.isSearching
                      ? "No bookings match your search"
                      : "No provider portal bookings yet."}
                  </Table.Empty>
                ) : (
                  filtered.map((b) => (
                    <Table.Row
                      key={b.id}
                      onClick={() => router.push(`/provider/bookings/${b.visit_id}`)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <Table.Cell>
                        <span className="font-mono text-sm text-slate-900">
                          {b.booking_number}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-xs text-slate-500 font-mono truncate block max-w-[160px]">
                          {b.visit_id}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="text-sm text-slate-900">
                          {b.patient?.name || "-"}
                        </div>
                        {b.patient?.identification_no && (
                          <div className="text-xs text-slate-500 font-mono">
                            {b.patient.identification_no}
                          </div>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {b.claim_id ? (
                          <span className="text-xs text-slate-700 font-mono truncate block max-w-[140px]">
                            {b.claim_id}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Unassigned
                          </span>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-slate-700">
                          {b.services?.length ?? 0}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                            STATUS_BADGE[b.status ?? ""] ??
                            "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          {b.status?.replace(/_/g, " ") || "-"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-slate-600">
                          {formatDate(b.created_at)}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProviderBookingsPage() {
  return (
    <PermissionGate permission={Permission.VIEW_PROVIDER_BOOKINGS}>
      <ProviderBookingsContent />
    </PermissionGate>
  );
}
