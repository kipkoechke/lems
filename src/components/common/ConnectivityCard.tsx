"use client";

import { useRouter } from "next/navigation";
import { FaBroadcastTower } from "react-icons/fa";
import type { EquipmentConnectivity } from "@/services/apiConnectivity";

interface ConnectivityCardProps {
  connectivity?: EquipmentConnectivity | null;
  /**
   * Equipment listing to open when a figure is clicked. The `linked` filter on
   * those listings means the same thing as the number here, so the card links
   * straight through to the matching rows.
   */
  equipmentHref?: string;
  className?: string;
}

/**
 * Equipment connectivity, as reported by every dashboard.
 *
 * The three figures overlap on purpose — `live` is a subset of `linked` — so
 * the card says so rather than letting them read as a breakdown that should
 * add up. What matters operationally is `never_connected`: those units have
 * never reached VEMS at all, which is a setup problem rather than a device
 * that happens to be switched off.
 */
export const ConnectivityCard: React.FC<ConnectivityCardProps> = ({
  connectivity,
  equipmentHref,
  className = "",
}) => {
  const router = useRouter();

  if (!connectivity) return null;

  const { live, linked, never_connected: neverConnected, total } = connectivity;
  const linkedShare = total > 0 ? Math.round((linked / total) * 100) : 0;

  const go = (query: string) => {
    if (!equipmentHref) return;
    router.push(`${equipmentHref}${query}`);
  };

  const figures = [
    {
      label: "Live now",
      value: live,
      cls: "text-emerald-600",
      hint: "Connected to VEMS at this moment",
      query: "?linked=true",
    },
    {
      label: "Ever seen",
      value: linked,
      cls: "text-violet-600",
      hint: "Has reported at least once",
      query: "?linked=true",
    },
    {
      label: "Never seen",
      value: neverConnected,
      cls: "text-amber-600",
      hint: "Has never reached VEMS — check the AE title and network path",
      query: "?linked=false",
    },
  ];

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        <FaBroadcastTower className="w-3.5 h-3.5 text-slate-400" />
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Equipment Connectivity
        </p>
        <span className="ml-auto text-xs text-slate-400">
          {total.toLocaleString()} units
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {figures.map((figure) => (
          <button
            key={figure.label}
            type="button"
            onClick={() => go(figure.query)}
            title={figure.hint}
            disabled={!equipmentHref}
            className={`text-left rounded-lg px-2 py-1.5 transition-colors ${
              equipmentHref ? "hover:bg-slate-50 cursor-pointer" : "cursor-default"
            }`}
          >
            <p className={`text-xl font-bold ${figure.cls}`}>
              {figure.value.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">{figure.label}</p>
          </button>
        ))}
      </div>

      {/* One bar, because live sits inside linked rather than beside it. */}
      <div className="mt-3">
        <div className="h-1.5 w-full rounded-full bg-amber-100 overflow-hidden flex">
          <div
            className="h-full bg-violet-400"
            style={{ width: `${linkedShare}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">
          {linkedShare}% have reported at least once. Live is counted within
          those, not alongside them.
        </p>
      </div>
    </div>
  );
};
