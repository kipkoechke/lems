"use client";

interface ConnectivityBadgesProps {
  /** Connected to VEMS right now. */
  isConnected?: boolean | null;
  /** Has ever been seen on the network (`last_seen_at` is set). */
  linked?: boolean | null;
  lastSeenAt?: string | null;
  /** Stack the badges instead of placing them side by side. */
  stacked?: boolean;
}

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

export type ConnectionStateKey = "live" | "offline" | "never";

/** Where a device stands: live now, seen before but offline, or never seen. */
export const connectionState = (
  isConnected?: boolean | null,
  linked?: boolean | null,
): ConnectionStateKey => (isConnected ? "live" : linked ? "offline" : "never");

export const CONNECTION_STATE_LABELS: Record<ConnectionStateKey, string> = {
  live: "Live",
  offline: "Offline",
  never: "Never connected",
};

/**
 * The same facts as one badge, for a reader who needs the state rather than
 * the two flags behind it. The pair read "Offline · Never seen" on 34 of a
 * vendor's 38 machines — two badges saying one thing.
 */
export const ConnectionState: React.FC<
  Omit<ConnectivityBadgesProps, "stacked">
> = ({ isConnected, linked, lastSeenAt }) => {
  const state = connectionState(isConnected, linked);
  const lastSeen = formatDateTime(lastSeenAt);
  const styles: Record<ConnectionStateKey, [string, string]> = {
    live: [
      "bg-emerald-50 text-emerald-700 border-emerald-200",
      "bg-emerald-500",
    ],
    offline: ["bg-slate-50 text-slate-600 border-slate-200", "bg-slate-400"],
    never: ["bg-amber-50 text-amber-700 border-amber-200", "bg-amber-400"],
  };
  const titles: Record<ConnectionStateKey, string> = {
    live: "Connected to VEMS right now",
    offline: lastSeen
      ? `Has connected before — last seen ${lastSeen}`
      : "Has connected before, not connected now",
    never: "Has never reached VEMS — check the AE title and network path",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${styles[state][0]}`}
      title={titles[state]}
    >
      <span className={`w-2 h-2 rounded-full ${styles[state][1]}`} />
      {CONNECTION_STATE_LABELS[state]}
      {state === "offline" && lastSeen && (
        <span className="font-normal text-slate-400">· {lastSeen}</span>
      )}
    </span>
  );
};

/**
 * Live and linked state for one device.
 *
 * These answer different questions and both matter on a listing: `linked` is
 * "has this device ever reached VEMS", `is_connected` is "is it connected
 * right now". A never-seen device has usually never been cabled up or has the
 * wrong AE title, which is a different problem from one that is merely offline
 * at this moment — so they get separate badges rather than one traffic light.
 */
export const ConnectivityBadges: React.FC<ConnectivityBadgesProps> = ({
  isConnected,
  linked,
  lastSeenAt,
  stacked = false,
}) => {
  const lastSeen = formatDateTime(lastSeenAt);

  return (
    <div
      className={`flex ${stacked ? "flex-col items-start" : "flex-wrap items-center"} gap-1`}
    >
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
          isConnected
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-slate-50 text-slate-500 border-slate-200"
        }`}
        title={
          isConnected
            ? "Connected to VEMS right now"
            : lastSeen
              ? `Not connected right now — last seen ${lastSeen}`
              : "Not connected right now"
        }
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
          }`}
        />
        {isConnected ? "Live" : "Offline"}
      </span>

      {linked === true && (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-violet-50 text-violet-700 border-violet-200"
          title={
            lastSeen
              ? `Seen on the network — last seen ${lastSeen}`
              : "Has been seen on the network"
          }
        >
          Linked
        </span>
      )}

      {linked === false && (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200"
          title="This device has never reached VEMS — check the AE title and network path"
        >
          Never seen
        </span>
      )}
    </div>
  );
};
