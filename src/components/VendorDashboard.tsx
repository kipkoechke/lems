"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FaArrowRight,
  FaChartLine,
  FaCog,
  FaFileContract,
  FaMoneyBillWave,
  FaPlug,
} from "react-icons/fa";
import { useMyVendor } from "@/features/vendors/useMyVendor";
import { useVendorDashboard } from "@/features/vendors/useVendorDashboard";
import { useVendorEquipments } from "@/features/vendors/useVendorEquipments";
import { useVendorBookingsPaginated } from "@/features/vendors/useVendorBookings";
import { useVendorContracts } from "@/features/vendors/useVendorContracts";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { ErrorState } from "@/components/common/ErrorState";
import { equipmentDeviceName } from "@/services/apiEquipment";
import type { VendorEquipment } from "@/services/apiEquipment";
import type { VendorBookingItem } from "@/types/booking";
import { kes, titleCase } from "@/lib/format";
import {
  VendorServiceStatus,
  isAwaitingDelivery,
  isDelivered,
  shareOf,
} from "@/features/vendors/vendorServiceStatus";

/**
 * The vendor's overview.
 *
 * Built around the three things a vendor checks, in the order they depend on
 * each other: are my machines connected (nothing else happens until they
 * are), is work reaching them, and what have I earned from it. The admin
 * dashboard it replaced answered other questions — revenue by payment type,
 * booking source, a facility filter holding one facility — and most of its
 * panels were empty for a vendor.
 *
 * Every figure says what it counts. Two it used to show were wrong for a
 * vendor: "Facilities 1" (the facilities with a booking, not the 38 under
 * contract) and "Services delivered 3" (booked, none delivered).
 */

type Period = "7d" | "30d" | "90d" | "all";

// Short labels: four of "30 days" wrap to two lines each on a phone. The
// long form is what the figures beneath quote.
const PERIODS: { value: Period; label: string; long: string }[] = [
  { value: "7d", label: "7d", long: "Last 7 days" },
  { value: "30d", label: "30d", long: "Last 30 days" },
  { value: "90d", label: "90d", long: "Last 90 days" },
  { value: "all", label: "All time", long: "All time" },
];

const PERIOD_DAYS: Record<Exclude<Period, "all">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

const periodStart = (period: Period): Date | null => {
  if (period === "all") return null;
  const start = new Date();
  start.setDate(start.getDate() - PERIOD_DAYS[period]);
  return start;
};

const shortDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : "—";

export default function VendorDashboard() {
  const [period, setPeriod] = useState<Period>("30d");
  const start = periodStart(period);

  const { vendor, vendorId } = useMyVendor();
  const dashboard = useVendorDashboard(
    vendorId,
    start ? { from: isoDate(start), to: isoDate(new Date()) } : undefined,
  );
  // A vendor's fleet is tens of machines, so one page holds all of them.
  const equipment = useVendorEquipments(vendorId, { per_page: 100 });
  const bookings = useVendorBookingsPaginated({ per_page: 100 });
  const contracts = useVendorContracts({ per_page: 1 });

  const machines: VendorEquipment[] = useMemo(
    () => equipment.data?.data ?? [],
    [equipment.data],
  );

  const inPeriod: VendorBookingItem[] = useMemo(
    () =>
      bookings.bookings.filter(
        (item) => !start || new Date(item.booking.created_at) >= start,
      ),
    // `start` is derived from `period`; a new Date each render would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookings.bookings, period],
  );

  if (dashboard.error) {
    return (
      <ErrorState
        title="Unable to load your overview"
        error={dashboard.error}
        action={{ label: "Try again", onClick: () => dashboard.refetch() }}
        fullScreen
      />
    );
  }

  const data = dashboard.data;
  const name = data?.vendor?.name ?? vendor?.name;
  const code = data?.vendor?.code ?? vendor?.code;

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-3 md:space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 shrink-0 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaChartLine className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-slate-900">Overview</h1>
                <p className="text-sm text-slate-500 truncate">
                  {[name, code].filter(Boolean).join(" · ") || " "}
                </p>
              </div>
            </div>
            <SegmentedControl
              value={period}
              onChange={setPeriod}
              options={PERIODS}
            />
          </div>
        </div>

        <MachinesCard machines={machines} loading={equipment.isLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-4">
          <WorkCard
            className="lg:col-span-3"
            items={inPeriod}
            truncated={
              (bookings.pagination?.total ?? 0) > bookings.bookings.length
            }
            unmatched={data?.unmatched_studies}
            loading={bookings.isLoading || dashboard.isLoading}
            periodLabel={PERIODS.find((p) => p.value === period)!.long}
          />
          <EarningsCard
            className="lg:col-span-2"
            items={inPeriod}
            share={data?.revenue?.vendor_share}
            loading={bookings.isLoading || dashboard.isLoading}
          />
        </div>

        <CoverageCard
          contracted={contracts.summary?.facilities}
          servedInPeriod={data?.facilities_served?.length}
          lots={data?.lots_covered ?? []}
          loading={contracts.isLoading || dashboard.isLoading}
        />
      </div>
    </div>
  );
}

// ── Cards ─────────────────────────────────────────────────────────────────

function Card({
  title,
  icon,
  action,
  className = "",
  children,
}: {
  title: string;
  icon: React.ReactNode;
  action?: { label: string; href: string };
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`bg-white rounded-lg border border-slate-200 p-4 md:p-5 ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span className="text-slate-400">{icon}</span>
          {title}
        </h2>
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
          >
            {action.label}
            <FaArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Figure({
  label,
  value,
  note,
}: {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-2xl font-bold text-slate-900 tabular-nums">
        {value}
      </p>
      {note && <p className="mt-0.5 text-xs text-slate-500">{note}</p>}
    </div>
  );
}

const Placeholder = ({ rows = 3 }: { rows?: number }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="h-10 rounded bg-slate-100" />
    ))}
  </div>
);

/**
 * Connection state of the fleet: one bar, three parts that add up to it.
 * Live sits inside linked (a machine connected now has reached VEMS before),
 * so the parts are live, linked-but-offline and never connected.
 */
function MachinesCard({
  machines,
  loading,
}: {
  machines: VendorEquipment[];
  loading: boolean;
}) {
  const total = machines.length;
  const live = machines.filter((m) => m.is_connected).length;
  const offline = machines.filter((m) => m.linked && !m.is_connected);
  const never = total - live - offline.length;
  const awaiting = machines.filter(
    (m) => m.status === "pending_installation",
  ).length;
  // Installed and marked active, yet never seen: the configuration on the
  // machine is the likely gap, and it is the vendor's to fix.
  const installedSilent = machines.filter(
    (m) => m.status === "active" && !m.linked,
  );

  const attention = [
    ...offline.map((m) => ({
      machine: m,
      reason: "Connected before, offline now",
    })),
    ...installedSilent.map((m) => ({
      machine: m,
      reason: "Installed, never connected",
    })),
  ].slice(0, 5);

  const share = (n: number) => (total ? `${(n / total) * 100}%` : "0%");

  return (
    <Card
      title="Your machines"
      icon={<FaPlug />}
      action={{ label: "All equipment", href: "/vendor/equipments" }}
    >
      {loading ? (
        <Placeholder />
      ) : !total ? (
        <p className="text-sm text-slate-500">
          No machines are registered to you yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {live} of {total} {total === 1 ? "machine is" : "machines are"}{" "}
              connected now
            </p>
            <div
              className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-slate-200"
              role="img"
              aria-label={`${live} live, ${offline.length} offline, ${never} never connected`}
            >
              <div className="bg-emerald-500" style={{ width: share(live) }} />
              <div
                className="bg-blue-400"
                style={{ width: share(offline.length) }}
              />
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <Legend swatch="bg-emerald-500" label="Live now" value={live} />
              <Legend
                swatch="bg-blue-400"
                label="Offline"
                value={offline.length}
              />
              <Legend
                swatch="bg-slate-200"
                label="Never connected"
                value={never}
              />
            </dl>
            {awaiting > 0 && (
              <Link
                href="/vendor/equipments?status=pending_installation"
                className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800 hover:bg-amber-100"
              >
                <span>
                  <b className="font-semibold">{awaiting}</b>{" "}
                  {awaiting === 1 ? "machine is" : "machines are"} awaiting
                  installation
                </span>
                <FaArrowRight className="w-3 h-3 shrink-0" />
              </Link>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Needs attention
            </p>
            {attention.length ? (
              <ul className="divide-y divide-slate-100">
                {attention.map(({ machine, reason }) => (
                  <li key={machine.id}>
                    <Link
                      href={`/vendor/equipments/${machine.id}`}
                      className="flex items-center justify-between gap-3 py-2.5 hover:bg-slate-50 -mx-2 px-2 rounded"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-900">
                          {machine.facility?.name
                            ? titleCase(machine.facility.name)
                            : equipmentDeviceName(machine.name)}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {equipmentDeviceName(machine.name)} · {reason}
                        </span>
                      </span>
                      <FaArrowRight className="w-3 h-3 shrink-0 text-slate-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                Every machine that has been installed is connected.
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

const Legend = ({
  swatch,
  label,
  value,
}: {
  swatch: string;
  label: string;
  value: number;
}) => (
  <div className="min-w-0">
    <dt className="flex items-center gap-1.5 text-xs text-slate-500">
      <span className={`h-2 w-2 shrink-0 rounded-full ${swatch}`} />
      <span className="truncate">{label}</span>
    </dt>
    <dd className="mt-0.5 text-lg font-semibold text-slate-900 tabular-nums">
      {value}
    </dd>
  </div>
);

/** What reached the vendor's machines in the period, and how far it got. */
function WorkCard({
  items,
  truncated,
  unmatched,
  loading,
  periodLabel,
  className,
}: {
  items: VendorBookingItem[];
  truncated: boolean;
  unmatched?: number | { total?: number; this_month?: number };
  loading: boolean;
  periodLabel: string;
  className?: string;
}) {
  const delivered = items.filter(isDelivered).length;
  const waiting = items.filter(isAwaitingDelivery).length;
  const nonSha =
    typeof unmatched === "number" ? unmatched : (unmatched?.total ?? 0);
  const nonShaMonth =
    typeof unmatched === "object" ? unmatched?.this_month : undefined;

  const latest = [...items]
    .sort((a, b) => b.booking.created_at.localeCompare(a.booking.created_at))
    .slice(0, 5);

  return (
    <Card
      title="Work on your machines"
      icon={<FaCog />}
      action={{ label: "All bookings", href: "/vendor/bookings" }}
      className={className}
    >
      {loading ? (
        <Placeholder rows={4} />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Figure
              label="Services booked"
              value={items.length}
              note={periodLabel}
            />
            <Figure label="Delivered" value={delivered} />
            <Figure label="Not yet delivered" value={waiting} />
          </div>

          <Link
            href="/studies/unmatched"
            className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            <span>
              <b className="font-semibold tabular-nums">
                {nonSha.toLocaleString()}
              </b>{" "}
              non-SHA studies on your machines
              {nonShaMonth != null && (
                <span className="text-slate-500">
                  {" "}
                  · {nonShaMonth.toLocaleString()} this month
                </span>
              )}
            </span>
            <FaArrowRight className="w-3 h-3 shrink-0 text-slate-400" />
          </Link>

          <p className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Latest bookings
          </p>
          {latest.length ? (
            <ul className="divide-y divide-slate-100">
              {latest.map((item) => {
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {item.service?.name ?? "Service"}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {titleCase(item.facility?.name ?? "")} ·{" "}
                        {shortDate(item.booking.created_at)}
                      </span>
                    </span>
                    <VendorServiceStatus status={item.status} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">
              No bookings on your machines in this period.
            </p>
          )}
          {truncated && (
            <p className="mt-2 text-xs text-slate-400">
              Counted from your latest 100 bookings.
            </p>
          )}
        </>
      )}
    </Card>
  );
}

/**
 * The vendor's share, split by whether the service behind it was delivered.
 * The split is the useful part: a share on a service not yet delivered is
 * work promised, not work done.
 */
function EarningsCard({
  items,
  share,
  loading,
  className,
}: {
  items: VendorBookingItem[];
  share?: number;
  loading: boolean;
  className?: string;
}) {
  const earned = shareOf(items.filter(isDelivered));
  const pending = shareOf(items.filter(isAwaitingDelivery));

  return (
    <Card
      title="Your earnings"
      icon={<FaMoneyBillWave />}
      action={{ label: "Payments", href: "/finance/payments" }}
      className={className}
    >
      {loading ? (
        <Placeholder rows={3} />
      ) : (
        <div className="space-y-4">
          <Figure
            label="Your share of services booked"
            value={kes(share ?? earned + pending)}
          />
          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
            <Figure
              label="From delivered services"
              value={<span className="text-lg">{kes(earned)}</span>}
            />
            <Figure
              label="Waiting on delivery"
              value={<span className="text-lg">{kes(pending)}</span>}
            />
          </div>
        </div>
      )}
    </Card>
  );
}

/** Where the vendor is under contract, against where work has come from. */
function CoverageCard({
  contracted,
  servedInPeriod,
  lots,
  loading,
}: {
  contracted?: number;
  servedInPeriod?: number;
  lots: { number: string; name: string }[];
  loading: boolean;
}) {
  return (
    <Card
      title="Coverage"
      icon={<FaFileContract />}
      action={{ label: "Contracts", href: "/vendor/contracts" }}
    >
      {loading ? (
        <Placeholder rows={1} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Figure label="Facilities under contract" value={contracted ?? "—"} />
          <Figure
            label="Facilities with bookings"
            value={servedInPeriod ?? 0}
            note="in this period"
          />
          <div className="col-span-2 lg:col-span-1 min-w-0">
            <p className="text-xs text-slate-500">Lots</p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {lots.length
                ? lots.map((lot) => `Lot ${lot.number}: ${lot.name}`).join(", ")
                : "—"}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
