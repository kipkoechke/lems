"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import {
  useVendorContract,
  useVendorContractServices,
} from "@/features/vendors/useVendorContracts";
import {
  contractLot,
  contractServiceCode,
  contractServiceName,
  contractServiceTariff,
} from "@/services/apiVendorContracts";
import { Table } from "@/components/Table";
import BackButton from "@/components/common/BackButton";
import { ErrorState } from "@/components/common/ErrorState";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expired: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-slate-50 text-slate-700 border-slate-200",
};

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const formatTariff = (value?: number | string | null) => {
  if (value === null || value === undefined || value === "") return "-";
  const amount = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(amount)) return String(value);
  return `KES ${amount.toLocaleString("en-KE")}`;
};

function VendorContractDetailContent({ contractId }: { contractId: string }) {
  const router = useRouter();
  const { contract, isLoading, error, refetch } = useVendorContract(contractId);
  // Services may arrive inline on the contract; the dedicated endpoint is the
  // fallback for when they don't.
  const { services: fetchedServices, isLoading: servicesLoading } =
    useVendorContractServices(contractId);

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-5 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <ErrorState
        title="Unable to Load Contract"
        error={error}
        message={
          !error && !contract ? "This contract could not be found." : undefined
        }
        action={{ label: "Try Again", onClick: () => refetch() }}
        fullScreen
      />
    );
  }

  const services = contract.services?.length
    ? contract.services
    : fetchedServices;

  const details = [
    { label: "Facility", value: contract.facility?.name },
    {
      label: "Facility Code",
      value: contract.facility?.code ?? contract.facility?.fr_code,
    },
    { label: "Lot", value: contractLot(contract)?.name },
    { label: "Start Date", value: formatDate(contract.start_date) },
    { label: "End Date", value: formatDate(contract.end_date) },
    {
      label: "Services",
      value:
        contract.services_count !== undefined
          ? String(contract.services_count)
          : services.length
            ? String(services.length)
            : undefined,
    },
  ];

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <BackButton onClick={() => router.push("/vendor/contracts")} />
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">
              {contract.contract_number || "Contract"}
            </h1>
            <p className="text-sm text-slate-500 truncate">
              {contract.facility?.name || "-"}
            </p>
          </div>
          <span
            className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${
              STATUS_BADGE[contract.status] ??
              "bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            {contract.status}
          </span>
        </div>

        {/* Details */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            {details.map((d) => (
              <div key={d.label}>
                <p className="text-xs text-slate-500">{d.label}</p>
                <p className="text-sm font-medium text-slate-900 break-words">
                  {d.value || "-"}
                </p>
              </div>
            ))}
          </div>
          {contract.notes && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">Notes</p>
              <p className="text-sm text-slate-700">{contract.notes}</p>
            </div>
          )}
        </div>

        {/* Services */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-4 md:px-6 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">
              Contracted Services
            </h2>
          </div>
          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Service</Table.HeaderCell>
                <Table.HeaderCell>Equipment</Table.HeaderCell>
                <Table.HeaderCell>Tariff</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {servicesLoading && services.length === 0 ? (
                <Table.Loading colSpan={4} rows={3} />
              ) : services.length === 0 ? (
                <Table.Empty colSpan={4}>
                  No services on this contract.
                </Table.Empty>
              ) : (
                services.map((s) => (
                  <Table.Row key={s.id}>
                    <Table.Cell>
                      <div className="font-medium text-slate-900">
                        {contractServiceName(s)}
                      </div>
                      {contractServiceCode(s) && (
                        <div className="text-xs text-slate-500 font-mono">
                          {contractServiceCode(s)}
                        </div>
                      )}
                      {s.lot?.name && (
                        <div className="text-xs text-slate-400">
                          LOT {s.lot.number} · {s.lot.name}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-sm text-slate-900">
                        {s.equipment?.name || "-"}
                      </div>
                      {s.equipment?.code && (
                        <div className="text-xs text-slate-500 font-mono">
                          {s.equipment.code}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {formatTariff(contractServiceTariff(s))}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          s.is_active === false
                            ? "bg-slate-50 text-slate-700 border-slate-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {s.is_active === false ? "Inactive" : "Active"}
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
  );
}

export default function VendorContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <PermissionGate permission={Permission.VIEW_VENDOR_CONTRACTS}>
      <VendorContractDetailContent contractId={id} />
    </PermissionGate>
  );
}
