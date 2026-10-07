export function LatestTime({ label, value }: { label: string; value?: string | null }) {
  const date = value ? new Date(value) : null;
  const validDate = date && !Number.isNaN(date.getTime());

  return (
    <p className="text-xs text-slate-500 mt-2">
      {label}: {validDate ? (
        <time dateTime={value!}>
          {date.toLocaleString("en-KE", {
            timeZone: "Africa/Nairobi",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })} EAT
        </time>
      ) : "Not available"}
    </p>
  );
}
